/*
 * MIT License
 *
 * Copyright (c) 2020. Nils Witt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const api_url = "https://vplan.moodle-paeda.de/api/index.php";
const token = localStorage.getItem("token");

function authError() {
    localStorage.removeItem("token");
    window.location.href = "/online/views/login.html"
}

class ApiConnector {

    public static testApiConnection(){
        return new Promise<number>(async (resolve, reject) => {
                try {
                    let res = await fetch(api_url + "/aushang", {
                        method: 'POST',
                        headers: {
                            "Authorization": "Bearer " + token,
                            "Content-Type": "application/json"
                        }
                    });
                    if(res.status === 200){
                        console.log("success")
                        resolve();
                    }else{
                        reject(2);
                        console.log("auth error")
                    }
                }catch (e) {
                    console.log(e);
                    reject(1);
                }
        });
    }

    public static async loadDataKlausuren() {
        return new Promise<void>(async (resolve, reject) => {
            let res;
            try {
                let headers = new Headers();
                headers.append("Authorization", "Bearer " + token);

                let requestOptions: any = {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                };

                res = await fetch(api_url + "/klausuren/active", requestOptions);
            } catch (e) {
                console.log(e);
            }

            if (res.status === 200) {
                resolve(await res.json());
            } else if (res.status == 401) {
                authError();
                return [];
            } else {
                reject();
            }
        });
    }

    public static async loadDataAushang(): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            let res: Response;
            try {
                let headers = new Headers();
                headers.append("Authorization", "Bearer " + token);

                let requestOptions: any = {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                };

                res = await fetch(api_url + "/aushang/active", requestOptions);
            } catch (e) {
                console.log(e);
            }

            if (res.status === 200) {
                resolve(await res.json());
            } else if (res.status == 401) {
                authError();
                return [];
            } else {
                reject();
            }
        });
    }

    public static addAushang(aushang) {
        return new Promise(async (resolve, reject) => {

            let res = await fetch(api_url + "/aushang", {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aushang),
                redirect: 'follow'
            });
            resolve(res);
        });
    }

    public static async loadVplanActiveDays(): Promise<string[]> {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + token);

        let requestOptions: any = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        let res = await fetch(api_url + "/vertretungsplan/activedays", requestOptions);
        if (res.status == 200) {
            return await res.json();
        } else if (res.status == 401) {
            authError();
            return [];
        } else {
            return [];
        }
    }

    public static async loadVplanByDay(date: string): Promise<any[]> {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + token);

        let requestOptions: any = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        let res = await fetch(api_url + "/vertretungsplan/vertretungen/date/" + date, requestOptions);
        return await res.json();
    }
}
