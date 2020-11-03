declare type APIRequest = import("express").Request & {
    permissions: number;
    user: any; // TODO
};

declare type APIResponse = import("express").Response;

interface APIEndpointHandler {
    handler(this: import("./src/server"), req: APIRequest, res: APIResponse): void;
    method: "get" | "post" | "patch" | "put" | "delete" | "head" | "options" | "use";
    path: string;
    pre?: Array<import("express").Handler>;
}