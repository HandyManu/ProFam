const doctoresControllers ={};

import doctoresModel from "../models/doctores.js"

doctoresControllers.getDoctor = async(req,res)=>{
    const doctor = await doctoresModel.find();
    res.json(branch);
};


doctoresControllers.deleteDoctor = async (req,res)=>{
await doctoresModel.findByIdAndDelete(req.params.id);
res.json({message : "Doctor eliminado"});
}

doctoresControllers.updateDoctor = async (req,res)=>{
    const { nombre, especialidad , correo , contraseña  } = req.body;
    const updateDoctor = await doctoresModel.findByIdAndUpdate(
        req.params.id,
        {nombre, especialidad , correo , contraseña },
        {new:true}
    );
    res.json({message:"Doctor actualizado"});
}

export default doctoresControllers;