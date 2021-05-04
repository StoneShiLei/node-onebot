//@ts-nocheck
let event: any;

function _exec(o: any, op = "and", field): boolean {

    if (["and", "not", "or"].includes(op)) {
        if (Array.isArray(o)) {
            for (let rule of o) {
                let matched = _exec(rule, "and", field);
                if (!matched && op === "and")
                    return false;
                if (matched && op === "not")
                    return false;
                if (matched && op === "or")
                    return true;
            }
            return op !== "or" || !o.length;
        } else if (typeof o === "object" && o !== null) {
            for (let k in o) {
                let matched;
                if (k.startsWith("."))
                    matched = _exec(o[k], k.substr(1), field);
                else
                    matched = _exec(o[k], "eq", k);
                if (!matched && op === "and")
                    return false;
                if (matched && op === "not")
                    return false;
                if (matched && op === "or")
                    return true;
            }
            return op !== "or" || !Object.keys(o).length;
        } else {
            return false;
        }
    }

    if (typeof o === "object" && o !== null && !Array.isArray(o))
        return _exec(o, "and", field);

    if (op === "eq") {
        return o === event[field];
    }

    if (op === "neq") {
        return o !== event[field];
    }

    if (op === "in") {
        return o.includes(event[field]);
    }

    if (op === "contains") {
        return event[field].includes(o);
    }

    if (op === "regex") {
        if (o.startsWith("/"))
            o = o.substr(1);
        const split = o.split("/");
        const regex = new RegExp(split[0], split[1]);
        return !!event[field].match(regex);
    }

    return true;
}

// function test() {
//     const filter = {}
//     const e = {
//         self_id: 123456,
//         time: 1606094532,
//         post_type: "message",
//         message_type: "group",
//         sub_type: "normal",
//         message_id: "REAq4xY6N/UAAAJIIjI65l+7DsQ=",
//         group_id: 123456,
//         group_name: "ddddd",
//         user_id: 123456,
//         anonymous: null,
//         message: "data",
//         raw_message: "data",
//         font: "微软雅黑",
//         sender: {
//           user_id: 123456,
//           nickname: "123456",
//           card: "",
//           sex: "female",
//           age: 115,
//           area: "上海",
//           level: 2,
//           role: "member",
//           title: ""
//         }
//       };
//     console.log(assert(filter, e));
// }
// test()

export function assert(filter: any, e: any) {
    if (!filter)
        return true;
    event = e;
    try {
        return _exec(filter);
    } catch {
        return false;
    }
}