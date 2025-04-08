import { Schema, model } from "mongoose";

const CitaSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    motivo: {
        type: String,
        required: true
    },
    doctorAsignado: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    pacienteAsignado: {
        type: Schema.Types.ObjectId,
        ref: "Paciente",
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Cita", CitaSchema);