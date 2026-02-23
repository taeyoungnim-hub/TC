import { IConnector } from '../types';
import { NaverSearchConnector } from './NaverSearchConnector';
import { GoogleCSEConnector } from './GoogleCSEConnector';

// 허용된 커넥터 레지스트리 (Allowlist 기반)
const connectorRegistry: IConnector[] = [
  new NaverSearchConnector(),
  new GoogleCSEConnector(),
];

export function getEnabledConnectors(): IConnector[] {
  return connectorRegistry.filter((c) => c.meta.isEnabled || process.env.NODE_ENV === 'development');
}

export function getConnectorById(id: string): IConnector | undefined {
  return connectorRegistry.find((c) => c.meta.id === id);
}

export { NaverSearchConnector, GoogleCSEConnector };
