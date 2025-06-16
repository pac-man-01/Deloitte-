import { useAuth } from "@/context/AuthContext";
import { useGetUserDetailsMutation } from "@/redux/services/serviceApi";
import {
    User,
    Mail,
    Badge,
    Briefcase,
    Layers,
    Grid,
    Tag,
    Users,
    Network,
} from "lucide-react";
import { useEffect } from "react";

export default function EmployeeProfile() {
    const { currentUser } = useAuth();
    const [fetchProfile,{data:employeeData,isLoading}]=useGetUserDetailsMutation();
    
    useEffect(() => {
        fetchProfile(currentUser.email);
    }, [currentUser]);

    console.log(employeeData);
    if (!employeeData || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
                <p className="mt-6 text-lg text-muted-foreground">Loading profile, please wait...</p>
            </div>
        );
    }

    const labelClass = "flex items-center gap-2 text-muted-foreground text-sm md:text-base";
    const valueClass = "font-medium text-foreground break-all";

    return (
        <div className="flex items-center justify-center px-4">
            <div className="w-full mx-auto bg-card rounded-2xl border border-border p-8 grid grid-cols-1 gap-6 relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute right-[-100px] top-[-100px] w-[220px] h-[220px] rounded-full bg-primary/10 blur-2xl z-0" />
                <div className="relative z-10 flex items-center gap-5 pb-4 border-b border-border mb-2">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
                            <User className="w-12 h-12 text-primary-foreground" />
                        </div>
                        <span className="absolute bottom-2 right-0 bg-accent rounded-full px-2 py-0.5 text-xs font-semibold text-accent-foreground shadow">
                            {employeeData?.designation}
                        </span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground leading-tight">
                            {employeeData?.name}
                        </div>
                        <div className="text-base text-muted-foreground">
                            {employeeData?.cec_role}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className={labelClass}>
                        <Mail className="w-4 h-4 text-chart-2" />
                        <span className="font-semibold">Email:</span>
                        <span className={valueClass}>{employeeData?.email}</span>
                    </div>
                    <div className={labelClass}>
                        <Badge className="w-4 h-4 text-chart-3" />
                        <span className="font-semibold">Resource ID:</span>
                        <span className={valueClass}>{employeeData?.resource_id}</span>
                    </div>
                    <div className={labelClass}>
                        <Badge className="w-4 h-4 text-chart-3" />
                        <span className="font-semibold">Employee Code</span>
                        <span className={valueClass}>{employeeData?.employee_code}</span>
                    </div>
                    <div className={labelClass}>
                        <Grid className="w-4 h-4 text-chart-4" />
                        <span className="font-semibold">Function:</span>
                        <span className={valueClass}>{employeeData?.employee_function}</span>
                    </div>
                    <div className={labelClass}>
                        <Briefcase className="w-4 h-4 text-chart-5" />
                        <span className="font-semibold">Service Area:</span>
                        <span className={valueClass}>{employeeData?.service_area}</span>
                    </div>
                    <div className={labelClass}>
                        <Users className="w-4 h-4 text-chart-1" />
                        <span className="font-semibold">Sub Service:</span>
                        <span className={valueClass}>{employeeData?.sub_service_area}</span>
                    </div>
                    <div className={labelClass}>
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="font-semibold">Skill Group:</span>
                        <span className={valueClass}>{employeeData?.skill_group}</span>
                    </div>
                    <div className={labelClass}>
                        <Tag className="w-4 h-4 text-chart-2" />
                        <span className="font-semibold">Skill Group Classification:</span>
                        <span className={valueClass}>{employeeData?.skill_group_classification}</span>
                    </div>
                    <div className={labelClass}>
                        <Network className="w-4 h-4 text-chart-3" />
                        <span className="font-semibold">Skill Set:</span>
                        <span className={valueClass}>{employeeData?.skill_set}</span>
                    </div>
                    <div className={labelClass + " col-span-1 md:col-span-2"}>
                        <Users className="w-4 h-4 text-chart-4" />
                        <span className="font-semibold">Talent Group:</span>
                        <span className={valueClass}>{employeeData?.talent_group}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
