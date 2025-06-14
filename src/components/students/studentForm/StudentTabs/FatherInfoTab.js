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
import { useFormContext } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export var FatherInfoTab = function () {
    var _a = useFormContext(), register = _a.register, errors = _a.formState.errors;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "father_name", children: "\u0627\u0633\u0645 \u0627\u0644\u0623\u0628 *" }), _jsx(Input, __assign({ id: "father_name" }, register("father_name", {
                        required: {
                            value: true,
                            message: "اسم الأب مطلوب",
                        },
                        minLength: {
                            value: 3,
                            message: "يجب أن يكون اسم الأب على الأقل 3 أحرف",
                        },
                        pattern: {
                            value: /^[\u0600-\u06FF\s]+$/,
                            message: "يجب أن يحتوي الاسم على أحرف عربية فقط",
                        },
                    }), { className: errors.father_name ? "border-red-500" : "" })), errors.father_name && (_jsx("p", { className: "text-sm text-red-500", children: errors.father_name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "father_job", children: "\u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0623\u0628 *" }), _jsx(Input, __assign({ id: "father_job" }, register("father_job", {
                        required: {
                            value: true,
                            message: "وظيفة الأب مطلوبة",
                        },
                        minLength: {
                            value: 2,
                            message: "يجب أن تكون الوظيفة على الأقل حرفين",
                        },
                    }), { className: errors.father_job ? "border-red-500" : "" })), errors.father_job && (_jsx("p", { className: "text-sm text-red-500", children: errors.father_job.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "father_address", children: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0623\u0628 *" }), _jsx(Input, __assign({ id: "father_address" }, register("father_address", {
                        required: {
                            value: true,
                            message: "عنوان الأب مطلوب",
                        },
                    }), { className: errors.father_address ? "border-red-500" : "" })), errors.father_address && (_jsx("p", { className: "text-sm text-red-500", children: errors.father_address.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "father_phone", children: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0627\u0644\u0623\u0628 *" }), _jsx(Input, __assign({ id: "father_phone", type: "tel" }, register("father_phone", {
                        required: {
                            value: true,
                            message: "رقم هاتف الأب مطلوب",
                        },
                        pattern: {
                            value: /^(0|09)\d{8}$/,
                            message: "يجب أن يكون رقم هاتف صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                        },
                    }), { className: errors.father_phone ? "border-red-500" : "" })), errors.father_phone && (_jsx("p", { className: "text-sm text-red-500", children: errors.father_phone.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "father_whatsapp", children: "\u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0623\u0628" }), _jsx(Input, __assign({ id: "father_whatsapp", type: "tel" }, register("father_whatsapp", {
                        pattern: {
                            value: /^(0|09)\d{8}$/,
                            message: "يجب أن يكون رقم هاتف صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                        },
                    }), { className: errors.father_whatsapp ? "border-red-500" : "" })), errors.father_whatsapp && (_jsx("p", { className: "text-sm text-red-500", children: errors.father_whatsapp.message }))] })] }));
};
