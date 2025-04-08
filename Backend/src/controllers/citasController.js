
const citasController = {};

import citaModel from "../models/citas.js ";

//select
citasController.getCita = async (req,res)=>{
    const cita = await citaModel.find();
    res.json (cita);
};

//delete
citasController.deleteCita = async (req,res)=>{
    await citaModel.findByIdAndDelete(req.params.id);
    res.json ({message:"Cita eliminada"});
};

//update
citasController.updateCita = async(req,res)=>{
    const { fecha , hora , motivo , doctorAsignado , pacienteAsignado} = req.body;
    const updateCita = await citaModel.findByIdAndUpdate (
        req.params.id,
        { fecha , hora , motivo , doctorAsignado , pacienteAsignado},
        {new:true}

    );
    res.json({message:"Cita actualizada correctamente"})
};

export default citasController;