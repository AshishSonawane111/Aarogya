import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Clock, Calendar, Check, Save, ShieldCheck, Plus, X } from 'lucide-react';

export const DoctorAvailabilityPage = () => {
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [blockedDates, setBlockedDates] = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useNotification();

  const daysMap = [
    { day: 0, label: 'Sunday' },
    { day: 1, label: 'Monday' },
    { day: 2, label: 'Tuesday' },
    { day: 3, label: 'Wednesday' },
    { day: 4, label: 'Thursday' },
    { day: 5, label: 'Friday' },
    { day: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    doctorAPI.getDashboard().then((res) => {
      const a = res.data?.availability;
      if (a) {
        if (a.working_days) setWorkingDays(a.working_days);
        if (a.start_time) setStartTime(a.start_time);
        if (a.end_time) setEndTime(a.end_time);
        if (a.slot_duration_minutes) setSlotDuration(a.slot_duration_minutes);
        if (a.break_start) setBreakStart(a.break_start);
        if (a.break_end) setBreakEnd(a.break_end);
        if (a.blocked_dates) setBlockedDates(a.blocked_dates);
      }
    }).catch((err) => console.error(err));
  }, []);

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddLeave = () => {
    if (!newLeaveDate || blockedDates.includes(newLeaveDate)) return;
    setBlockedDates([...blockedDates, newLeaveDate]);
    setNewLeaveDate('');
  };

  const handleRemoveLeave = (dateStr) => {
    setBlockedDates(blockedDates.filter((d) => d !== dateStr));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorAPI.updateAvailability({
        working_days: workingDays,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: Number(slotDuration),
        break_start: breakStart,
        break_end: breakEnd,
        blocked_dates: blockedDates
      });

      addToast({
        title: 'Availability Updated',
        message: 'The scheduling engine will now automatically apply your new working hours.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Doctor Availability & Working Hours Engine
        </h2>
        <p className="text-xs text-slate-500">
          Configure active clinic days, shift hours, break times, and slot duration. Changes immediately update patient booking availability.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Working Days Selector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Active Clinic Consultation Days
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {daysMap.map((d) => {
              const isSelected = workingDays.includes(d.day);
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleDay(d.day)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{d.label.slice(0, 3)}</div>
                  <span className="text-[10px] font-normal block opacity-80">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift Timings & Slot Duration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Clinic Hours & Appointment Slot Duration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lunch / Rest Break Start</label>
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Break End Time</label>
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Leave Dates / Blocked Times */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Block Off-Duty Dates / Leaves
          </h3>

          <div className="flex gap-2 text-xs">
            <input
              type="date"
              value={newLeaveDate}
              onChange={(e) => setNewLeaveDate(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 bg-white flex-1"
            />
            <button
              type="button"
              onClick={handleAddLeave}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Block Date
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {blockedDates.length === 0 ? (
              <span className="text-xs text-slate-400">No dates currently blocked.</span>
            ) : (
              blockedDates.map((dateStr) => (
                <span
                  key={dateStr}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2"
                >
                  <span>{dateStr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLeave(dateStr)}
                    className="text-rose-500 hover:text-rose-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Availability Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
