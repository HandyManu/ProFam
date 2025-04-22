import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

import PacienteModel from "../models/Paciente.js";
import { config } from "../config.js";

const registerPacientesController = {};

// Registro de paciente
registerPacientesController.registerPaciente = async (req, res) => {
    const { nombre, edad, correo, contraseña, telefono } = req.body;

    try {
        // Verificar si el correo ya está registrado
        const existingPaciente = await PacienteModel.findOne({ correo });
        if (existingPaciente) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear nuevo paciente
        const newPaciente = new PacienteModel({
            nombre,
            edad,
            correo,
            contraseña: hashedPassword,
            telefono,
            isVerified: false, // No está verificado al inicio
        });

        await newPaciente.save();

        // Generar código de verificación
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Generar un token con el código de verificación
        const tokenCode = jsonwebtoken.sign(
            { correo, verificationCode },
            config.JWT_SECRET,
            { expiresIn: "3h" }
        );

        // Guardar el token en una cookie segura
        res.cookie("verificationToken", tokenCode, { httpOnly: true, secure: true, maxAge: 3 * 60 * 60 * 1000 });

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
            subject: "Verificación de cuenta",
            text: `Tu código de verificación es: ${verificationCode}. Expira en 3 horas.`,
        };

        // Enviar correo de verificación
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Paciente registrado exitosamente. Verifica tu correo." });

    } catch (error) {
        console.error("Error al registrar el paciente:", error);
        return res.status(500).json({ message: "Error interno al registrar el paciente." });
    }
};

// Verificación de paciente
registerPacientesController.verifyPaciente = async (req, res) => {
    const { requiredCode } = req.body;
    const token = req.cookies.verificationToken;

    try {
        if (!token) {
            return res.status(400).json({ message: "Token de verificación no encontrado." });
        }

        const decodedToken = jsonwebtoken.verify(token, config.JWT_SECRET);
        const { correo, verificationCode: storedCode } = decodedToken;

        // Verificar si el código ingresado es correcto
        if (requiredCode !== storedCode) {
            return res.status(400).json({ message: "Código de verificación incorrecto." });
        }

        // Buscar el paciente y actualizar su estado de verificación
        const paciente = await PacienteModel.findOne({ correo });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado." });
        }

        paciente.isVerified = true;
        await paciente.save();

        // Limpiar la cookie de verificación
        res.clearCookie("verificationToken");

        return res.status(200).json({ message: "Paciente verificado exitosamente." });

    } catch (error) {
        console.error("Error al verificar el paciente:", error);
        return res.status(500).json({ message: "Error interno al verificar el paciente." });
    }
};

export default registerPacientesController;