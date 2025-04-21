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
        ref: "doctores",
        required: true
    },
    pacienteAsignado: {
        type: Schema.Types.ObjectId,
        ref: "pacientes",
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Cita", CitaSchema);