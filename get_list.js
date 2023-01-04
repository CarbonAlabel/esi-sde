import {parentPort, workerData} from "worker_threads";
import path from "path";
import fs from "fs";
import ESIRequest from "esi-request";
const ESI = new ESIRequest({pool_size: 3});

let {
    basePath,
    jobName,
    list,
    list_path,
    entry_path,
    id_param,
    id_append
} = workerData;

(async () => {
    console.time(jobName);
    if (!list) {
        list = await ESI.request(list_path).data;
    }
    list.sort((a, b) => a - b);
    let entries = await Promise.all(list.map(id => ESI.request(entry_path, {parameters: {[id_param]: id}}).data));
    console.timeEnd(jobName);
    if (id_append) {
        entries.forEach((entry, index) => entry[id_param] = list[index]);
    }
    fs.writeFileSync(path.join(basePath, "/", jobName + ".json"), JSON.stringify(entries, null, 4));
})().catch(console.error).finally(ESI.close);
