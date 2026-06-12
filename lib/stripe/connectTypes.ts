export interface PlayerConnectStatus {
  accountId: string | null;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  ready: boolean;
}

export interface ConnectOnboardResponse {
  url: string;
}
