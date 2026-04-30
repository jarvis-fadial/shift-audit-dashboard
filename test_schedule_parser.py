from datetime import date

import pandas as pd

from schedule_parser import aggregate_pay_periods, billable_shift_hours


def test_backup_counts_as_shift_burden_but_zero_hours():
    assert billable_shift_hours("Backup 6a-6a", "Backup", 0.0) == 0.0


def test_non_tec_non_backup_shift_gets_two_hour_cleanup_time():
    assert billable_shift_hours("ED Day 8a-4p", "Day", 8.0) == 10.0


def test_tec_shift_does_not_get_cleanup_time():
    assert billable_shift_hours("TEC 8a-4p", "TEC", 8.0) == 8.0


def test_pay_period_aggregation_uses_zero_backup_hours_and_cleanup_hours():
    df = pd.DataFrame([
        {"person": "Fadial", "pp": "2026 PP01", "pp_start": date(2026, 1, 4), "pp_end": date(2026, 1, 17), "shift_count": 1, "included_hours": 10.0, "backup_count": 0, "weekend": 0, "night": 0},
        {"person": "Fadial", "pp": "2026 PP01", "pp_start": date(2026, 1, 4), "pp_end": date(2026, 1, 17), "shift_count": 1, "included_hours": 0.0, "backup_count": 1, "weekend": 0, "night": 0},
    ])

    pp = aggregate_pay_periods(df)

    assert pp.loc[0, "shifts"] == 2
    assert pp.loc[0, "backups"] == 1
    assert pp.loc[0, "hours"] == 10.0
