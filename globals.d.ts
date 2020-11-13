declare type UserRole = "guest" | "individual" | "organization";

interface Client {
    registered: boolean;
    role:       UserRole;
    // TODO: define other fields of a user
}

declare type APIRequest = import("express").Request & {
    user: Client;
    payload: import("firebase-admin").auth.DecodedIdToken
};

declare type APIResponse = import("express").Response;

interface APIEndpointHandler {
    handler(this: import("./src/server/index"), req: APIRequest, res: APIResponse): void;
    method: "get" | "post" | "patch" | "put" | "delete" | "head" | "options" | "use";
    path: string;
    pre?: Array<import("express").Handler>;
}

interface ID { id: string; }

interface IndividualForm {
    firstname: string;
    lastname:  string;
    cause:     string[];
    zip:       string;
    skills:    string[];
    gender:    string;
}

declare type IndividualDocument = {
    id:        string;
    email:     string;
    ratings:   string[];
    following: string[];
} & IndividualForm & ID;

// Add more types as you need