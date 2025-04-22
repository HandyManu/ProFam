

import dotenv from "dotenv";
dotenv.config();
export const config = {
    db:{
        URI:process.env.DB_URI
    },
    server:{
        port:process.env.PORT
    },
    JWT:{
        SECRET:process.env.JWT_SECRET,
        EXPIRES_IN:process.env.JWT_EXPIRES
    },
    emailAdmin:{
        email:process.env.ADMIN_EMAIL,
        password:process.env.ADMIN_PASSWORD
    },
    email:{
        email_user:process.env.EMAIL_USER,
        email_pass:process.env.EMAIL_PASS
    },
}