import citasController from "../controllers/citasController.js";
import doctoresController from "../controllers/doctoresControllers.js";
import pacientesController from "../controllers/pacientesControllers.js";
import bcryptjs from "bcryptjs";
import jsonWebToken from "jsonwebtoken";
import {config} from "../config.js";



const loginController = {};

loginController.login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        let userFound;
        let userType;

        // Validación de administrador
        if (correo === config.ADMIN_EMAIL && contraseña === config.ADMIN_PASSWORD) {
            userFound = { _id: "admin" };
            userType = "admin";
        } else {
            // Búsqueda de usuario en doctores
            userFound = await doctoresController.findOne({ correo });
            userType = "doctor";

            if (!userFound) {
                // Búsqueda de usuario en pacientes
                userFound = await pacientesController.findOne({ correo });
                userType = "paciente";
            }

            // Si no se encuentra usuario, responder con error
            if (!userFound) {
                return res.status(400).json({ message: "Usuario no encontrado" });
            }

            // Validación de contraseña (excepto para el admin)
            if (userType !== "admin") {
                const isMatch = await bcryptjs.compare(contraseña, userFound.contraseña);
                if (!isMatch) {
                    return res.status(400).json({ message: "Contraseña incorrecta" });
                }
            }
        }

        // Generación del token
        const token = jsonWebToken.sign(
            { id: userFound._id, userType },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES }
        );

        // Configurar la cookie con el token y enviar respuesta
        res.cookie("authToken", token, { httpOnly: true, secure: true });
        res.json({ message: "Inicio de sesión exitoso", token });

    } catch (error) {
        console.error("Error en el proceso de login:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginController;
