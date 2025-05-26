import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {    super({
      clientID: configService.get('LINKEDIN_CLIENT_ID')!,
      clientSecret: configService.get('LINKEDIN_CLIENT_SECRET')!,
      callbackURL: configService.get('LINKEDIN_CALLBACK_URL')!,
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos[0] ? photos[0].value : null,
      provider: 'linkedin',
      providerId: profile.id,
    };
    
    const registeredUser = await this.authService.validateOAuthUser(user);
    done(null, registeredUser);
  }
}
