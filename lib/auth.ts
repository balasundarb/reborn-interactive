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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
     github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  },
  },
   
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  }
});