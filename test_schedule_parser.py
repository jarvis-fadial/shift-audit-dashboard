from datetime import date

import pandas as pd

from schedule_parser import aggregate_pay_periods, annual_leave_shift_credit, billable_shift_hours, federal_holiday_count


def test_backup_counts_as_shift_burden_but_zero_hours():
    assert billable_shift_hours("Backup 6a-6a", "Backup", 0.0) == 0.0


def test_non_tec_non_backup_shift_uses_parsed_duration_without_cleanup_time():
    assert billable_shift_hours("ED Day 8a-4p", "Day", 8.0) == 8.0


def test_tec_shift_does_not_get_cleanup_time():
    assert billable_shift_hours("TEC 8a-4p", "TEC", 8.0) == 8.0


def test_pay_period_aggregation_uses_zero_backup_hours_and_parsed_shift_hours():
    df = pd.DataFrame([
        {"person": "Fadial", "pp": "2026 PP01", "pp_start": date(2026, 1, 4), "pp_end": date(2026, 1, 17), "shift_count": 1, "included_hours": 8.0, "backup_count": 0, "weekend": 0, "night": 0},
        {"person": "Fadial", "pp": "2026 PP01", "pp_start": date(2026, 1, 4), "pp_end": date(2026, 1, 17), "shift_count": 1, "included_hours": 0.0, "backup_count": 1, "weekend": 0, "night": 0},
    ])

    pp = aggregate_pay_periods(df)

    assert pp.loc[0, "shifts"] == 2
    assert pp.loc[0, "backups"] == 1
    assert pp.loc[0, "hours"] == 8.0
    assert pp.loc[0, "federal_holidays"] == 0


def test_annual_leave_credit_is_point_six_five_shifts_per_effective_day():
    assert annual_leave_shift_credit(1) == 0.65
    assert annual_leave_shift_credit(3, federal_holidays=1) == 1.3
    assert annual_leave_shift_credit(1, federal_holidays=2) == 0.0


def test_federal_holiday_count_uses_observed_holidays_in_pay_period():
    assert federal_holiday_count(date(2026, 1, 18), date(2026, 1, 31)) == 1
    assert federal_holiday_count(date(2026, 1, 4), date(2026, 1, 17)) == 0
