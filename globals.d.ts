declare type UserRole = "guest" | "individual" | "organization";

interface Client {
    registered: boolean;
    role:       UserRole;
    // TODO: define other fields of a user
}

declare type APIRequest = import("express").Request & {
    payload: import("firebase-admin").auth.DecodedIdToken
};

declare type APIResponse = import("express").Response;

interface APIEndpointHandler {
    method: "get" | "post" | "patch" | "put" | "delete" | "head" | "options" | "use";
    path: string;
    pre?: Array<import("express").Handler>;
    allowGuest?: boolean;
    handler(this: import("./src/server/index"), req: APIRequest, res: APIResponse): void;
}

declare type ID = { id: string; }

declare type IndividualForm = {
    firstname: string;
    lastname:  string;
    cause:     string[];
    zip:       string;
    skills:    string[];
    age:    string;
}

declare type IndividualDocument = {
    email:     string;
    picture:   string;
    following: string[];
    location:  FirebaseFirestore.GeoPoint;
} & IndividualForm & ID;

declare type OrganizationForm = {
    title:   string;
    mission: string;
    cause:   string[];
    zip:     string;
    contact: string;
    url: string;
    events: string[];
}

declare type OrganizationDocument = {
    email:     string;
    picture:   string;
    ratings:   string[];
    followers: string[];
} & OrganizationForm & ID;

declare type RatingForm = {
    stars:       number;
    description: string;
}

declare type RatingDocument = {
    owner:    string; // individuals's ID
} & RatingForm;

declare type OrgEventForm = {
    title:    string;
    details:  string;
    zip:      string;
    skills:   string[];
    date:     string;
}

declare type OrgEventDocument = {
    owner:      string;  // org's ID
    location:   FirebaseFirestore.GeoPoint;
} & OrgEventForm;

// Add more types as you need