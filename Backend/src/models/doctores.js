import { Schema, model } from "mongoose";

const DoctorSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    especialidad: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    contraseña: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Doctor", DoctorSchema);