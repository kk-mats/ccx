import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import mongoDBStore from "connect-mongodb-session";

import AuthenticationError from "errors/AuthenticationError";
import UserEntity from "domain/UserEntity";
import AuthenticatingUser from "domain/query/AuthenticatingUser";
import UserService from "domain/services/UserService";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface User extends UserEntity {}
	}
}

const initializeServer = (): express.Express => {
	const Store = new (mongoDBStore(session))({
		uri: process.env.SESSION_DB_URI as string,
		collection: "sessions"
	});

	const server = express();
	server.disable("x-powered-by");

	server.use(express.json());
	server.use(express.urlencoded({ extended: true }));
	server.use(
		session({
			resave: false,
			saveUninitialized: true,
			secret: process.env.SESSION_SECRET as string,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24
			},
			store: Store
		})
	);
	server.use(passport.initialize());
	server.use(passport.session());

	passport.use(
		new LocalStrategy(
			{
				usernameField: "userId",
				passwordField: "password",
				passReqToCallback: true
			},
			async (req, userId, password, done) => {
				try {
					const user = await new AuthenticatingUser(
						userId,
						password
					).exec();

					if (user) {
						return done(null, user);
					}
					throw AuthenticationError.invalidUserIdOrPassword();
				} catch (err) {
					return done(err, false);
				}
			}
		)
	);

	passport.serializeUser<InternalUserEntityId>((user, done) => {
		done(null, user.userEntityId);
	});

	passport.deserializeUser<InternalUserEntityId>(
		async (userEntityId, done): Promise<void> => {
			const user = await UserService.findByUserEntityId(userEntityId);
			done(null, user || undefined);
		}
	);

	return server;
};

export default initializeServer;
