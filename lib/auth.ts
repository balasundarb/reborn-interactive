import { betterAuth } from "better-auth";
import { connectDB } from "./mongodb";
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { Resend } from 'resend';
import { resetPasswordTemplate } from "./email-templates/reset-password";

const db = await connectDB();
const resend = new Resend(process.env.RESEND_API_KEY);
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'my_secret_key_change_me_in_production',
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    resetPasswordEnabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
     const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: 'Reset Your Password - Reborn Interactive',
          html: resetPasswordTemplate(url, user.name),
        });

        if (error) {
          console.error(' Resend error:', error);
          throw error;
        }

        console.log('Email sent successfully:', data);
      } catch (error) {
        console.error('Failed to send reset email:', error);
        throw error;
      }
    },
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