from datetime import date

import pandas as pd

from schedule_parser import aggregate_pay_periods, comparison_summary


def test_backup_shifts_count_but_do_not_add_hours():
    df = pd.DataFrame([
        {
            "person": "Fadial",
            "date": date(2026, 4, 27),
            "pp": "2026 PP09",
            "pp_start": date(2026, 4, 26),
            "pp_end": date(2026, 5, 9),
            "shift_count": 1,
            "included_hours": 8.0,
            "backup_count": 0,
            "weekend": 0,
            "night": 0,
        },
        {
            "person": "Fadial",
            "date": date(2026, 4, 28),
            "pp": "2026 PP09",
            "pp_start": date(2026, 4, 26),
            "pp_end": date(2026, 5, 9),
            "shift_count": 1,
            "included_hours": 0.0,
            "backup_count": 1,
            "weekend": 0,
            "night": 0,
        },
    ])

    pp = aggregate_pay_periods(df)

    assert pp.loc[0, "shifts"] == 2
    assert pp.loc[0, "backups"] == 1
    assert pp.loc[0, "hours"] == 8.0


def test_comparison_summary_uses_hours_excluding_backups():
    pp = pd.DataFrame([
        {
            "person": "Fadial",
            "pp": "2026 PP09",
            "pp_start": date(2026, 4, 26),
            "pp_end": date(2026, 5, 9),
            "shifts": 10,
            "hours": 72.0,
            "backups": 2,
            "weekends": 2,
            "nights": 1,
        }
    ])

    summary = comparison_summary(pp)

    assert summary.loc[0, "total_shifts"] == 10
    assert summary.loc[0, "total_backups"] == 2
    assert summary.loc[0, "total_hours"] == 72.0
    assert summary.loc[0, "pp_ge_80"] == 0
    assert summary.loc[0, "pp_ge_64"] == 1
