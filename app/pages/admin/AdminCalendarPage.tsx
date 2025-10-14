"use client";
import { useEffect, useRef, useState } from 'react';
import { AdminCalendarFilter, Calendar, weeklyPayType } from '@/app/components/Calendar';
import { Status } from '@/app/components/utils/getStatusColor';
import dayjs from 'dayjs';
import Dropdown from '@/app/components/Dropdown';
import { fetchLocations } from '@/app/controllers/Location';
import { getEventInputShifts, publishBulkShift } from '@/app/controllers/Shifts';
import { fetchAllEmployees } from '@/app/controllers/User';
import Checkbox from '@/app/components/Checkbox';
import { fetchLeaves } from '@/app/controllers/Leave';
import Layout from '@/app/components/Layout';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import { EventInput } from '@fullcalendar/core';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';
import { FaClipboardList, FaMapPin, FaUser } from 'react-icons/fa';



function hasExtendedProps(
  e: any
): e is EventInput & { extendedProps: { published?: boolean | number } } {
  return e && typeof e === "object" && "extendedProps" in e;
}



export default function AdminCalendarPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const account = useAuth().user;

  const [activeFilter, setActiveFilter] = useState<AdminCalendarFilter>({
    status: ['All shifts'],
    location: ['All locations'],
    month: dayjs(),
    employee: ['All employees'],
    show_unpublished: false,
  });

  const setStatus = (status: string[]) => setActiveFilter((p) => ({ ...p, status }));
  const setLocation = (location: string[]) => setActiveFilter((p) => ({ ...p, location }));
  const setMonth = (month: dayjs.Dayjs) => setActiveFilter((p) => ({ ...p, month }));
  const setShowUnpublished = (shown: boolean) => setActiveFilter((p) => ({ ...p, show_unpublished: shown }));
  const setEmployee = (employee: string[]) => setActiveFilter((p) => ({ ...p, employee }));

  const [employees, setEmployees] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [events, setEvents] = useState<EventInput[]>();
  const [allEvents, setAllEvents] = useState<EventInput[]>();
  const [loadingEvents, setLoadingEvents] = useState(false);

    // --- Sticky "Show Unpublished Shifts" setup ---
  const SHOW_UNPUBLISHED_KEY = 'admin.show_unpublished';
  const [isMounted, setIsMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHOW_UNPUBLISHED_KEY);
      if (saved !== null) {
        setActiveFilter((prev) => ({ ...prev, show_unpublished: saved === '1' }));
      }
    } catch (err) {
      console.warn('[AdminCalendar] Failed to read localStorage', err);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // Save preference whenever it changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(
        SHOW_UNPUBLISHED_KEY,
        activeFilter.show_unpublished ? '1' : '0'
      );
    } catch (err) {
      console.warn('[AdminCalendar] Failed to write localStorage', err);
    }
  }, [activeFilter.show_unpublished, isMounted]);
  // --- end sticky toggle setup ---


  useEffect(() => {
    async function fetchEvents() {
      const shifts = await getEventInputShifts(account!.id, (activeFilter.month.month() + 1).toString());
      const leaves = await fetchLeaves(account!.id);
      const combined = [...shifts, ...leaves];
      setAllEvents(combined);

      if (activeFilter.show_unpublished) setEvents(combined);
      else setEvents(combined.filter((e) => hasExtendedProps(e) && !!e.extendedProps?.published));

    }

    (async () => {
      setLoadingEvents(true);
      try {
        await fetchEvents();
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, [activeFilter.month]);

useEffect(() => {
  setEvents(
    activeFilter.show_unpublished
      ? allEvents
      : allEvents?.filter((e) => hasExtendedProps(e) && !!e.extendedProps?.published)
  );
}, [activeFilter.show_unpublished, allEvents]);


  useEffect(() => {
    (async () => {
      const locs = await fetchLocations();
      setLocations(locs.map((l) => l.name));
      const emps = await fetchAllEmployees();
      setEmployees(emps.map((e) => e.first_name + ' ' + e.last_name));
    })();
  }, []);

  const setYear = (year: number) =>
    setMonth(dayjs().year(year).month(activeFilter.month.month()).date(activeFilter.month.date()));
  const handleMonthChange = (e: PickerValidDate) => setMonth(e);
  const monthSelectedDropdown =
    activeFilter.month.year() === dayjs().year()
      ? activeFilter.month.format('MMMM')
      : `${activeFilter.month.format('MMMM')}, ${activeFilter.month.year()}`;
  const isOverMd = useIsOverMd();

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<'publish' | 'weekly-pay'>('publish');
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const displayToast = (m: string, t: 'success' | 'error') => {
    setMessage(m);
    setToastType(t);
    setToastShown(true);
  };

  const publishShift = async (month?: string, year?: string) => {
    try {
      setLoadingEvents(true);
      const res = await publishBulkShift(month, year);
      setOpenModal(false);
      if (res) {
        if (month || year)
          displayToast('Successfully published shifts for this month! Refresh to view changes.', 'success');
        else displayToast('Successfully published all upcoming shifts! Refresh to view changes.', 'success');
      } else displayToast('Failed to publish multiple shifts!', 'error');
    } finally {
      setLoadingEvents(false);
    }
  };

  const [trHeights, setTrHeights] = useState<number[]>([]);
  const targetRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const sourceEl = document.querySelector<HTMLElement>('.fc-scroller-liquid-absolute');
    const targetEl = targetRef.current;
    if (!sourceEl || !targetEl) return;
    const handleScroll = () => {
      targetEl.scrollTop = sourceEl.scrollTop;
      targetEl.scrollLeft = sourceEl.scrollLeft;
    };
    sourceEl.addEventListener('scroll', handleScroll);
    return () => sourceEl.removeEventListener('scroll', handleScroll);
  }, [events]);

  const [weeklyPay, setWeeklyPay] = useState<weeklyPayType[]>([]);
  const [weeklyPayIndex, setWeeklyPayIndex] = useState<number | null>(null);

  return (
    <Layout modalContainer={modalContainer}>
      <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown} />
      <div className="relative flex-[1] h-full bg-[#f4f4f4]">
        {loadingEvents && (
          <div className="absolute rounded-lg top-0 left-0 w-full h-full z-20">
            <Spinner />
          </div>
        )}
        <div className="p-4 h-full flex flex-col">
          {account && (
            <h2 className="text-2xl mb-4">
              Welcome, <span className="text-primary font-semibold">{account.first_name + ' ' + account.last_name}</span>
            </h2>
          )}

          {allEvents === undefined ? (
            <Spinner custom showWater backgroundGradient borderSpinner />
          ) : (
            <>
              <div className="flex h-full flex-1 gap-2">
                {/* PAY COLUMN */}
                <div className="h-full hidden md:block">
                  <div style={{ height: document.getElementById('top-section')?.clientHeight + 'px' }}>&nbsp;</div>
                  <div
                    style={{ height: document.getElementsByClassName('fc-dayGridMonth-view').item(0)?.clientHeight + 'px' }}
                    className="overflow-hidden"
                    ref={targetRef}
                  >
                    <table className="border-separate border-spacing-0">
                      <thead>
                        <tr
                          className="sticky top-0 z-10"
                          style={{
                            height:
                              document.getElementsByClassName('fc-scrollgrid-sync-inner').item(0)?.clientHeight + 'px',
                          }}
                        >
                          <th className="border bold text-primary bg-[#f2f2f2] border-light-grey">Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trHeights.length > 0 &&
                          trHeights.map((height, index) => (
                            <tr key={index} style={{ height: height + 'px' }}>
                              <td
                                className="max-w-24 border px-3 text-hover font-semibold border-light-grey cursor-pointer hover:border-primary hover:bg-hover text-center hover:text-white duration-400 transition-colors"
                                onClick={() => {
                                  setWeeklyPayIndex(index);
                                  setModalType('weekly-pay');
                                  setOpenModal(true);
                                }}
                              >
                                ${weeklyPay[index]?.total ? Math.round(weeklyPay[index].total * 100) / 100 : 0}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MAIN CALENDAR */}
                <div className="flex flex-col flex-1">
                  <div id="top-section" className="flex justify-between items-end">
                    <div>
                      <div className="flex justify-between items-center mb-2 md:mb-0">
                        <div className="flex items-start flex-row flex-wrap gap-3 ">
                          <Dropdown
                            items={['All employees', ...employees]}
                            placeholder="Select employee"
                            actAsFilter
                            setFilter={setEmployee}
                            maxVisibleItems={6}
                            containerClassName="md:rounded-b-none md:min-w-32"
                            initialSelectedItem="All employees"
                            simplifyOnMobile
                            replacementIcon={<FaUser />}
                          />
                          <Dropdown
                            items={['All locations', ...locations]}
                            placeholder="Select location"
                            actAsFilter
                            setFilter={setLocation}
                            maxVisibleItems={6}
                            containerClassName="md:rounded-b-none md:min-w-32"
                            initialSelectedItem="All locations"
                            simplifyOnMobile
                            replacementIcon={<FaMapPin />}
                          />
                          <Dropdown
                            items={[
                              'All shifts',
                              ...Object.values(Status).slice(0, Object.values(Status).length - 3),
                            ]}
                            placeholder="Select shift"
                            actAsFilter
                            setFilter={setStatus}
                            maxVisibleItems={6}
                            containerClassName="md:rounded-b-none min-w-fit"
                            initialSelectedItem="All shifts"
                            disableTyping
                            simplifyOnMobile
                            replacementIcon={<FaClipboardList />}
                          />
                        </div>
                      </div>
                    </div>

                    {allEvents && allEvents.find((e) => e.extendedProps?.published === 0) ? (
                      <div className="flex flex-col items-end gap-2">
                        <Checkbox
                          checked={activeFilter.show_unpublished}
                          onChange={(e) => setShowUnpublished(e)}
                          label="Show unpublished shifts"
                          className="text-sm -mt-7"
                        />
                        {activeFilter.show_unpublished && (
                          <Button
                            className="rounded-b-none rounded-t-md py-2 px-4"
                            fontSize="0.8em"
                            onClick={() => {
                              setModalType('publish');
                              setOpenModal(true);
                            }}
                          >
                            Publish all shifts
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="h-fit text-white text-sm py-2 font-semibold rounded-t-md rounded-b-none bg-light-grey px-4 flex items-center">
                        All shifts published for this month
                      </div>
                    )}
                  </div>

                  <Calendar
                    key={isOverMd ? 'month' : 'list'}
                    events={events ?? []}
                    showSelectedFilter={activeFilter}
                    modalContainer={modalContainer}
                    hideHeader
                    initialView={isOverMd ? 'dayGridMonth' : 'listMonth'}
                    setColHeights={setTrHeights}
                    setWeeklyPay={setWeeklyPay}
                  />
                </div>
              </div>

              {modalContainer.current && (
                <Modal
                  details={{}}
                  shown={openModal}
                  setShown={setOpenModal}
                  modalContainer={modalContainer.current}
                  setParentOpen={setOpenModal}
                  displayToast={displayToast}
                  title={modalType === 'publish' ? 'Publish all shifts confirmation' : 'Weekly pay details'}
                  customButtons={
                    modalType === 'publish' ? (
                      <div className="flex items-center justify-end gap-4">
                        <Button
                          type="cta"
                          fontSize="0.8em"
                          className="py-3 px-5"
                          onClick={() =>
                            publishShift(
                              (activeFilter.month.month() + 1).toString(),
                              activeFilter.month.year().toString()
                            )
                          }
                        >
                          This Month Only
                        </Button>
                        <Button
                          type="cta"
                          htmlType="submit"
                          fontSize="0.8em"
                          className="py-3 px-5"
                          onClick={() => publishShift()}
                        >
                          All Shifts
                        </Button>
                      </div>
                    ) : undefined
                  }
                >
                  {modalType === 'publish' && (
                    <div className="mt-4">
                      You are about to publish multiple shifts. Would you like to publish only the shifts scheduled for
                      this month ({activeFilter.month.format('MMMM YYYY')}) or all upcoming shifts?
                    </div>
                  )}

                  {modalType === 'weekly-pay' && weeklyPayIndex !== null && weeklyPay[weeklyPayIndex] && (
                    <div>
                      <div className="font-medium text-secondary mb-4">
                        <div>Date: {`${weeklyPay[weeklyPayIndex].date_start} - ${weeklyPay[weeklyPayIndex].date_end}`}</div>
                        <div>
                          Total: $
                          {weeklyPay[weeklyPayIndex]?.total
                            ? Math.round(weeklyPay[weeklyPayIndex].total * 100) / 100
                            : 0}
                        </div>
                      </div>
                      {weeklyPay[weeklyPayIndex].assignees?.length > 0 ? (
                        weeklyPay[weeklyPayIndex].assignees.map((a, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className={`text-right mr-2 w-48 ${!a.name ? 'text-gray-600' : ''}`}>
                              {a.name ? a.name : 'Open/unassigned shifts'}:
                            </span>
                            <span
                              className={`${!a.name ? 'text-gray-600' : 'text-primary font-medium'}`}
                            >
                              {a.duration
                                ? Math.floor(a.duration / 60) + 'h' + (a.duration % 60 > 0 ? ' ' + (a.duration % 60) + 'm' : '')
                                : '0h'}
                            </span>
                            -
                            <span
                              className={`${!a.name ? 'text-gray-600' : 'text-hover font-medium'}`}
                            >
                              ${a.total_pay ?? 0}
                            </span>
                          </div>
                        ))
                      ) : (
                        'There are no shifts this week'
                      )}
                    </div>
                  )}
                </Modal>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
