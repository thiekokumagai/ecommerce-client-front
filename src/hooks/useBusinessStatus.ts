import { useMemo } from "react";

export interface BusinessHourInterval {
  open: string;
  close: string;
}

export interface BusinessHourRule {
  id: string;
  days: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  intervals: BusinessHourInterval[];
}

export function useBusinessStatus(businessHours: BusinessHourRule[] | undefined | null) {
  return useMemo(() => {
    if (!businessHours || businessHours.length === 0) {
      return {
        isOpen: false, // Default to closed if not configured
        todayRules: null,
      };
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayRule = businessHours.find((rule) => rule.days.includes(dayOfWeek));

    if (!todayRule || todayRule.intervals.length === 0) {
      return { isOpen: false, todayRules: null };
    }

    const isOpen = todayRule.intervals.some((interval) => {
      const [openHour, openMin] = interval.open.split(":").map(Number);
      const [closeHour, closeMin] = interval.close.split(":").map(Number);
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    });

    return {
      isOpen,
      todayRules: todayRule.intervals,
    };
  }, [businessHours]);
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function getTodayWeekdayName() {
  const day = new Date().getDay();
  return WEEKDAYS[day];
}
