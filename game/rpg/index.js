/**
 * RPG Pixel Fantasy Engine & Server Entrypoint
 */

import { RpgServer } from './server/wsServer.js';
import { getRpgHtml } from './assets/clientHtml.js';

export function initRpgServer(httpServer = null) {
	return RpgServer.getInstance(httpServer);
}

export function getRpgServer() {
	return RpgServer.getInstance();
}

export { getRpgHtml };
export default initRpgServer;
