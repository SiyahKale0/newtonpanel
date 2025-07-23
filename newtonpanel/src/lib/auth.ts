import { NextAuthOptions } from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// NextAuth User tipini genişlet
declare module 'next-auth' {
  interface User {
    role?: string;
    profile?: any;
    permissions?: string[];
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      profile?: any;
      permissions?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    profile?: any;
    permissions?: string[];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(db as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          const user = userCredential.user;
          
          // Firestore'dan kullanıcı profilini al
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          return {
            id: user.uid,
            email: user.email,
            name: userData?.profile?.firstName + ' ' + userData?.profile?.lastName,
            role: userData?.role || 'therapist',
            profile: userData?.profile,
            permissions: userData?.permissions || []
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.profile = user.profile;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.profile = token.profile;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};