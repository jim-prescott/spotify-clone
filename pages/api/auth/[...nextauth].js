import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import spotifyAPI, { LOGIN_URL } from '../../../lib/spotify'

async function refreshAccessToken(token) {
  try {
    spotifyAPI.setAccessToken(token.accessToken)
    spotifyAPI.setRefreshToken(token.refreshToken)

    const { body: refreshedToken } = await spotifyAPI.refreshAccessToken()

    console.log('Refreshed token is: ', refreshedToken)

    return {
      ...token,
      accessToken: refreshedToken.accessToken,
      accessTokenExpires: Date.now + refreshedToken.expires_in * 1000,
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        }
      }

      // return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        console.log('Existing access token is valid...')
        return token
      }

      // access token has expired
      console.log('Access token has expired, refreshing...')
      return await refreshAccessToken()
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.refreshToken = token.refreshToken
      session.user.username = token.username

      return session
    },
  },
})
