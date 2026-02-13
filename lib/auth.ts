import { betterAuth } from "better-auth";
import { connectDB } from "./mongodb";
import { mongodbAdapter } from 'better-auth/adapters/mongodb';


const db = await connectDB();
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'my_secret_key_change_me_in_production',
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

 
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds (5 minutes)
    }
  }
});