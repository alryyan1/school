var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export var AdditionalInfoTab = function () {
    var _a = useFormContext(), register = _a.register, errors = _a.formState.errors;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "other_parent", children: "\u0648\u0644\u064A \u0623\u0645\u0631 \u0622\u062E\u0631" }), _jsx(Input, __assign({ id: "other_parent" }, register("other_parent"), { className: errors.other_parent ? "border-red-500" : "" })), errors.other_parent && (_jsx("p", { className: "text-sm text-red-500", children: errors.other_parent.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "relation_of_other_parent", children: "\u0635\u0644\u0629 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0622\u062E\u0631" }), _jsx(Input, __assign({ id: "relation_of_other_parent" }, register("relation_of_other_parent"), { className: errors.relation_of_other_parent ? "border-red-500" : "" })), errors.relation_of_other_parent && (_jsx("p", { className: "text-sm text-red-500", children: errors.relation_of_other_parent.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "relation_job", children: "\u0648\u0638\u064A\u0641\u0629 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0622\u062E\u0631" }), _jsx(Input, __assign({ id: "relation_job" }, register("relation_job"), { className: errors.relation_job ? "border-red-500" : "" })), errors.relation_job && (_jsx("p", { className: "text-sm text-red-500", children: errors.relation_job.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "relation_phone", children: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0622\u062E\u0631" }), _jsx(Input, __assign({ id: "relation_phone", type: "tel" }, register("relation_phone"), { className: errors.relation_phone ? "border-red-500" : "" })), errors.relation_phone && (_jsx("p", { className: "text-sm text-red-500", children: errors.relation_phone.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "relation_whatsapp", children: "\u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0622\u062E\u0631" }), _jsx(Input, __assign({ id: "relation_whatsapp", type: "tel" }, register("relation_whatsapp"), { className: errors.relation_whatsapp ? "border-red-500" : "" })), errors.relation_whatsapp && (_jsx("p", { className: "text-sm text-red-500", children: errors.relation_whatsapp.message }))] })] }));
};
