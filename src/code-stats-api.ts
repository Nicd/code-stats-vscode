
import { Pulse } from "./pulse";
import { getISOTimestamp, getLanguageName } from "./utils";
import * as axios from "axios";

export class CodeStatsAPI {
    private API_KEY = null;
    private UPDATE_URL = "https://codestats.net/api/my/pulses";
    private axios = null;

    constructor(apiKey: string, apiURL: string) {
        this.API_KEY = apiKey;
        this.UPDATE_URL = apiURL;
        if (this.API_KEY === null || this.API_KEY === undefined || this.API_KEY === '') {
            return;
        }

        this.axios = axios.default.create({
            baseURL: this.UPDATE_URL,
            timeout: 1000,
            headers: {
                "X-API-Token": this.API_KEY,
                "Content-Type": "application/json"
            }
        });

    }

    public sendUpdate(pulse: Pulse): void {
        // If we did not have API key, don't try to update
        if (this.axios === null) {
            return null;
        }

        // tslint:disable-next-line:typedef
        const data = new ApiJSON(new Date());

        for (let lang of pulse.xps.keys()) {
            let languageName: string = getLanguageName(lang);
            let xp: number = pulse.getXP(lang);
            data.xps.push(new ApiXP(languageName, xp));
        }

        let json: string = JSON.stringify(data);
        console.log(`JSON: ${json}`);

        this.axios.post(this.UPDATE_URL, json)
            .then( (response) => {
                console.log(response);
            })
            .then ( () => {
                pulse.reset();
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

class ApiJSON {
    constructor(date: Date) {
        this.coded_at = getISOTimestamp(new Date());
        this.xps = new Array<ApiXP>();
    }

    coded_at: string;
    xps: Array<ApiXP>;
}

class ApiXP {
    constructor(language: string, xp: number) {
        this.language = language;
        this.xp = xp;
    }

    language: string;
    xp: number;
}
