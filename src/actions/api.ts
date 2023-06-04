import {config} from "@fck-foundation/ton/dist/config.js";
import axios from "axios";
export const sendPatch = async (endpoint: string, data: object) => {
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    let tries = 5;
    while(tries-- > 0) {
        try {
            // @ts-ignore
            data.api_key = config.MAINNET_API_KEY;
            const res = await axios.patch(`https://api.fck.foundation/api${endpoint}`, data);
            tries = 0;
            return res;
        } catch (e) {
            console.error(e);
            console.log(`[FCK-PAYMENT-PROCESSOR] Error detected! Trying again after 300ms... (Tries remaining: ${tries--}/5)`);
            await sleep(300);
        }
    }
    return null;
}

export const sendPost = async (endpoint: string, data: object) => {
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    let tries = 5;
    while(tries-- > 0) {
        try {
            // @ts-ignore
            data.api_key = config.MAINNET_API_KEY;
            const res = await axios.post(`https://api.fck.foundation/api${endpoint}`, data, {
                headers: {
                    "Accept": "application/json"
                }
            });
            tries = 0;
            console.log(res.data);
            return res;
        } catch (e) {
            if(axios.isAxiosError(e)) {
                if(e.response?.status === 400) {
                    tries = 0;
                    return null;
                }
            }
            console.error(e);
            console.log(`[FCK-PROCESSOR] Error detected! Trying again after 300ms... (Tries remaining: ${tries--}/5)`);
            await sleep(300);
        }
    }
    return null;
}