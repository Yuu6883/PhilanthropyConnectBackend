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

declare type ID = { id: string; }

declare type IndividualForm = {
    firstname: string;
    lastname:  string;
    cause:     string[];
    zip:       string;
    skills:    string[]; // not in schema?
    gender:    string;   //?? dont we delete this
}

declare type IndividualDocument = {
    email:     string;
    ratings:   string[];
    following: string[];
    location:  FirebaseFirestore.GeoPoint;
} & IndividualForm & ID;

declare type OrganizationForm = {
    title:   string;
    // TODO:
}

declare type OrganizationDocument = {
    ratings:   string[];
    followers: string[];
} & OrganizationForm & ID;

declare type RatingForm = {
    stars:       number;
    description: string;
}

declare type RatingDocument = {
    owner:    string; // what is this? user ID, name, or email??
    org_name: string;
} & RatingForm;

declare type OrgEventForm = {
    title:    string;
    details:  string;
    zip:      string;
    skills:   string[];
    date:     string; // event date? string or something else? 
}

declare type OrgEventDocument = {
    owner:      string;  // org's ID, name or, ????
    is_current: boolean;
    location:   FirebaseFirestore.GeoPoint;
} & OrgEventForm;

// Add more types as you need