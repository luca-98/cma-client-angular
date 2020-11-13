import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

export interface Credentials {
  token: string;
  userName: string;
  fullName: string;
  roomName: string;
  userGroupCode: string;
  permissionCode: string[];
  staffId: string;
  roomId: string;
  remember?: boolean;
}

const credentialsKey = 'cma_credentials';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class CredentialsService {

  private credentialsVar: Credentials | null = null;
  private isRemember: boolean | null = null;

  constructor(
    private websocketService: WebsocketService
  ) {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this.credentialsVar = JSON.parse(savedCredentials);
      this.isRemember = this.credentialsVar.remember;
      this.websocketService.initSubcribe(this.credentialsVar.token);
    }
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentialsVar;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this.credentialsVar;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials, remember?: boolean): void {
    this.credentialsVar = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      this.isRemember = remember;
      credentials.remember = remember;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
      this.websocketService.initSubcribe(this.credentialsVar.token);
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
      this.websocketService.unsubcribe();
    }
  }

  updateCredentials(credentials: Credentials) {
    const storage = this.isRemember ? localStorage : sessionStorage;
    storage.setItem(credentialsKey, JSON.stringify(credentials));
  }

}
