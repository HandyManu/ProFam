import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

import doctoresModel from "../models/doctores.js";
import { config } from "../config.js";


const registerDoctoresController = {};

// Registro de doctor
registerDoctoresController.registerDoctor = async (req, res) => {
    const { nombre, especialidad, correo, contraseña } = req.body;

    try {
        // Verificar si el correo ya está registrado
        const existingDoctor = await doctoresModel.findOne({ correo });
        if (existingDoctor) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear un nuevo doctor con la estructura original
        const newDoctor = new doctoresModel({
            nombre,
            especialidad,
            correo,
            contraseña: hashedPassword,
            verificado: false, // Se mantiene como en el original
        });

        await newDoctor.save();

        // Generar un código de verificación
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Generar un token con el código de verificación
        const tokenCoded = jsonwebtoken.sign(
            { correo, verificationCode },
            config.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Guardar el token en una cookie
        res.cookie("verificationToken", tokenCoded, { httpOnly: true, secure: true, maxAge: 3 * 60 * 60 * 1000 });

        // Configuración del servicio de correo
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        });

        // Configurar opciones del correo con el código de verificación
        const mailOptions = {
            from: config.EMAIL_USER,
            to: correo,
            subject: "Verificación de correo",
            text: `Por favor verifica tu correo utilizando este código: ${verificationCode}. Expira en 3 horas.`,
        };

        // Enviar correo de verificación
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Doctor registrado exitosamente. Verifica tu correo." });

    } catch (error) {
        console.error("Error al registrar el doctor:", error);
        return res.status(500).json({ message: "Error interno al registrar el doctor." });
    }
};

// Verificación de doctor
registerDoctoresController.verifyDoctor = async (req, res) => {
    const { requiredCode } = req.body;
    const token = req.cookies.verificationToken;

    try {
        if (!token) {
            return res.status(400).json({ message: "Token de verificación no encontrado." });
        }

        const decoded = jsonwebtoken.verify(token, config.JWT_SECRET);
        const { correo, verificationCode: storedCode } = decoded;

        // Verificar si el código ingresado es correcto
        if (requiredCode !== storedCode) {
            return res.status(400).json({ message: "Código de verificación incorrecto." });
        }

        // Buscar el doctor y actualizar su estado de verificación
        const doctor = await doctoresModel.findOne({ correo });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor no encontrado." });
        }

        doctor.verificado = true;
        await doctor.save();

        // Limpiar la cookie de verificación
        res.clearCookie("verificationToken");

        return res.status(200).json({ message: "Doctor verificado exitosamente." });

    } catch (error) {
        console.error("Error al verificar el doctor:", error);
        return res.status(500).json({ message: "Error interno al verificar el doctor." });
    }
};

export default registerDoctoresController;
