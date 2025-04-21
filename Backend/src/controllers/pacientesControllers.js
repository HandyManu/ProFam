const pacientesControllers = {};

import pacientesModel from "../models/pacientes.js";

pacientesControllers.getPacientes = async (req, res) => {
    const pacientes = await pacientesModel.find();
    res.json(pacientes);
}

pacientesControllers.deletePaciente = async (req, res) => {
    await pacientesModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Paciente eliminado" });
}  

pacientesControllers.updatePaciente = async (req, res) => {
    const { nombre, apellido, correo, contraseña } = req.body;
    const updatePaciente = await pacientesModel.findByIdAndUpdate(
        req.params.id,
        { nombre, apellido, correo, contraseña },
        { new: true }
    );
    res.json({ message: "Paciente actualizado" });
}   

export default pacientesControllers; 