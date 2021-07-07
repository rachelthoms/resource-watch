import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import {
  signIn,
  signOut,
} from 'services/auth';
import {
  fetchUser,
} from 'services/user';

// tests
import authPayload from '../../../cypress/fixtures/auth.json';

// time the session will be active if the user is inactive.
const MAX_AGE = 12 * 60 * 60; // 12 hours

const options = {
  pages: {
    signIn: '/sign-in',
  },
  session: {
    jwt: true,
    maxAge: MAX_AGE,
  },
  providers: [
    Providers.Credentials({
      id: 'email-password',
      name: 'email + password',
      async authorize(credentials) {
        const {
          email,
          password,
        } = credentials;

        if (process.env.TEST_ENV === 'FRONTEND') return authPayload;

        const { status, data } = await signIn(({ email, password }));
        if (status === 200) return data.data;
        throw new Error(data.data);
      },
    }),
    Providers.Credentials({
      id: 'third-party',
      name: 'third-party',
      async authorize(credentials) {
        console.log('CREDENTIALS', credentials);
        const { token } = credentials;
        const user = await fetchUser(`Bearer ${token}`);
        console.log('USER', user);
        return ({
          ...user,
          token,
        });
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      return ({
        ...token,
        ...user?.token && {
          accessToken: user.token,
        },
      });
    },
    async session(session, token) {
      const newSession = session;
      newSession.accessToken = token.accessToken;
      console.log('SESSION CALLBACK', newSession);
      return newSession;
    },
    async redirect(callbackUrl) {
      // By default it should be redirect to /
      if (['/sign-in', '/sign-up', '/auth-callback'].includes(callbackUrl)) {
        return '/';
      }
      return callbackUrl;
    },
  },

  events: {
    async signOut(session) {
      // After sign-out expire token in the API
      if (session) await signOut(session.accessToken);
    },
  },
};

export default NextAuth(options);
