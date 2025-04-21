import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

import doctoresModel from "../models/doctores.js";
import { config } from "../config.js";

const registerDoctoresController = {};

registerDoctoresController.registerDoctor = async (req, res) => {   
    const { nombre, especialidad, correo, contraseña } = req.body;

    try{
        // Verificar si el correo ya está registrado
        const existingDoctor = await doctoresModel.findOne({ correo });
        if (existingDoctor) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear un nuevo doctor
        const newDoctor = new doctoresModel({
            nombre,
            especialidad,
            correo,
            contraseña: hashedPassword
        });

        // Guardar el doctor en la base de datos
        await newDoctor.save();

        // Generar un token de verificación
        const verificationToken = crypto.randomBytes(3).toString("hex");;

        // Enviar un correo de verificación
        const tokenCoded = jsonwebtoken.sign({ correo, verificationToken }, config.jwt.secret, { expiresIn: '1h' });

        res.cookie (verificationToken, tokenCoded, { maxAge: 3 * 60 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.correo.email,
                pass: config.contraseña.password
            }
        });

        const mailOptions = {
            from: config.correo.email,
            to: correo,
            subject: 'Verificación de correo',
            text: `Por favor verifica tu correo haciendo clic en el siguiente enlace:`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: "Error al enviar el correo de verificación" });
            } else {
                return res.status(200).json({ message: "Doctor registrado y correo de verificación enviado" });
            }
        });

        res.json({ message: "Doctor registrado y correo de verificación enviado" });

    }
    catch (error) {
        console.error("Error al registrar el doctor:", error);
        return res.status(500).json({ message: "Error al registrar el doctor"+ error });
    };

    registerDoctoresController.verifyDoctor = async (req, res) => {
        const {requiredCode} = req.body;
        const  token  = req.cookies.verificationToken;

        try {
            const decoded = jsonwebtoken.verify(token, config.jwt.secret);
            const { email, verificationCode: storedCode } = decoded;

            // Verificar si el token de verificación es correcto
            if (requiredCode !== storedCode) {
                return res.status(400).json({ message: "Código de verificación incorrecto" });
            }

           const doctor = await doctoresModel.findOne({ correo: email });
            if (!doctor) {
                return res.status(404).json({ message: "Doctor no encontrado" });
            }

            // Actualizar el estado de verificación del doctor
            doctor.verificado = true;
            await doctor.save();

            res.clearCookie("verificationToken");
            res.json({ message: "Doctor verificado exitosamente" });
        }
        catch (error) {
            console.error("Error al verificar el doctor:", error);
            return res.status(500).json({ message: "Error al verificar el doctor" });
        }
    }

}
export default registerDoctoresController;