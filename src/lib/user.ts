// User / session helper — delegates to the auth module.

import { getSessionUser } from './auth';

export async function getCurrentUser() {
  const session = await getSessionUser();
  return { id: session.id, cookie: session.cookie };
}

export const USER_COOKIE_NAME = 'iptv_uid';
