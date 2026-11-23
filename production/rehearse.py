"""Run a fictional Field Notes desk rehearsal without accounts or dependencies."""
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Note:
    team: str
    opted_in: bool
    first_run: str
    changed_run: str


def next_action(note):
    if not note.opted_in:
        return "Hold for permission"
    if not note.first_run:
        return "Ask to see the baseline"
    if not note.changed_run or note.changed_run == note.first_run:
        return "Draft a question about what changed"
    return "Draft a before-and-after interview card"


def main():
    morning = Note("Fictional Team Finch", True, "All replies got a demo link", "")
    lunch = replace(morning, changed_run="Budget objection got a cost breakdown")
    cases = [
        ("Morning", morning, "Draft a question about what changed"),
        ("Lunch", lunch, "Draft a before-and-after interview card"),
        ("Same evidence repeated", replace(lunch, changed_run=morning.first_run),
         "Draft a question about what changed"),
        ("Permission withdrawn", replace(lunch, opted_in=False), "Hold for permission"),
        ("Missing baseline", replace(lunch, first_run=""), "Ask to see the baseline"),
    ]
    for label, note, expected in cases:
        action = next_action(note)
        if action != expected:
            raise RuntimeError(f"{label}: expected {expected}, got {action}")
        print(f"{label}: {action}")
        if action == "Draft a before-and-after interview card":
            print(f'  {note.team}: “{note.first_run}” → “{note.changed_run}”.')
            print("  What observation triggered the change? What happened on the next reply?")
    print("5/5 rehearsal checks passed. Model calls: 0. External actions: 0.")


if __name__ == "__main__":
    main()
