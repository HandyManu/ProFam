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
        let userType ;

        //admin 

        if (correo === config.adminUser.EMAIL && contraseña === config.adminPassword.PASSWORD) {
            userFound = {_id:"admin"};
            userType = "admin";
        } else {
            //doctor
            userFound = await doctoresController.findOne({ correo });
            userType = "doctor";

            if (!userFound) {
                //paciente
                userFound = await pacientesController.findOne({ correo });
                userType = "paciente";
            }

            if (!userFound) {
                return res.status(400).json({ message: "Usuario no encontrado" });
            }

            if (userType!== "admin" ) {
                const isMatch = await bcryptjs.compare(contraseña, userFound.contraseña);
                if (!isMatch) {
                    return res.status(400).json({ message: "Contraseña incorrecta" });
                }
            }
            //generar el token 
            jsonWebToken.sign(
                { id: userFound._id, userType },
                config.jwt.secret,
                { expiresIn: config.JWT.EXPIRES_IN },
                (err, token) => {
                    res.cookie("authToken",token)
                    res.json({ message: "Logged in successfully" });
                    
                }
            );

           
    
        }  
      }     
        catch (error) {
            console.error("Error al generar el token:", error);
            return res.status(500).json({ message: "Error al generar el token" });
        }
        
};

export default loginController;