import {Worker} from "worker_threads";
import path from "path";
import fs from "fs";
import {once} from "events";

const [basePath = "sde"] = process.argv.slice(2);

const baseData = {basePath}

if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, {recursive: true});
}

const runningJobs = [];

function getList(data) {
    const worker = new Worker("./get_list.js", {workerData: {...baseData, ...data}});
    runningJobs.push(once(worker, "exit"));
}



// Corporations
getList({
    basePath,
    jobName: "npccorps",
    list_path: "/v1/corporations/npccorps/",
    entry_path: "/v4/corporations/{corporation_id}/",
    id_param: "corporation_id",
    id_append: true
});

// Dogma
getList({
    jobName: "dogma_attributes",
    list_path: "/v1/dogma/attributes/",
    entry_path: "/v1/dogma/attributes/{attribute_id}/",
    id_param: "attribute_id"
});
getList({
    jobName: "dogma_effects",
    list_path: "/v1/dogma/effects/",
    entry_path: "/v2/dogma/effects/{effect_id}/",
    id_param: "effect_id"
});

// Loyalty
// https://github.com/esi/esi-issues/issues/798

// Market
new Worker("./get_list.js", {
    workerData: {
        basePath,
        jobName: "market_groups",
        list_path: "/v1/markets/groups/",
        entry_path: "/v1/markets/groups/{market_group_id}/",
        id_param: "market_group_id"
    }
});


// Opportunities
new Worker("./get_list.js", {
    workerData: {
        basePath,
        jobName: "opportunity_groups",
        list_path: "/v1/opportunities/groups/",
        entry_path: "/v1/opportunities/groups/{group_id}/",
        id_param: "group_id"
    }
});
new Worker("./get_list.js", {
    workerData: {
        basePath,
        jobName: "opportunity_tasks",
        list_path: "/v1/opportunities/tasks/",
        entry_path: "/v1/opportunities/tasks/{task_id}/",
        id_param: "task_id"
    }
});

// Universe
// ...
console.time("total");
Promise.all(runningJobs).then(() => {
    console.timeEnd("total");
});

