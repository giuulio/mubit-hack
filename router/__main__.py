"""The lesson router as commands. Run as `python -m router <command> --help`.

Commands that run in a context take --context (an id); without it they use the model's first context.

  create    Create a model for a domain (one Mubit task per model), with its first context.
  context   Add a context to a model, or list them; contexts share the model's weights.
  generate  Preview outputs under the current context (never kept).
  feedback  Give a direction, critique, pick or edit; extracted lessons wait for confirmation.
  lessons   List lessons with their routes and reasons.
  confirm   Confirm a lesson: measure its signals, route it and apply it.
  reject    Reject a pending lesson.
  train     Send training calls under the approved context (recorded in full).
  adapter   Record an adapter version seen in the Mubit console.
  message   Print the message to paste into Try models.
  import    Import adapter outputs copied from Try models (JSON: [{concept, content}]).
  absorb    Test whether the adapter follows a lesson without it in context; retire it if so.
  eval      Evaluate configurations on held-out concepts.
"""

import argparse
import json
import sys

from . import pipeline, store


def show_lessons(project):
    for x in project["lessons"]:
        signals = x.get("signals") or {}
        effect = signals.get("effect")
        effect = f" effect {effect:.0%}" if effect is not None else ""
        print(f"{x['id']}  {x['context']:<10} {x.get('reach') or '-':<8} {x['status']:<14} {x.get('route') or '-':<9} {x['expressible_as'] or '-':<10} {x['scope'] or '-':<8} {x['statement']}")
        if x.get("reason"):
            print(f"{'':<14}{x['reason']}{effect}")


def main():
    parser = argparse.ArgumentParser(prog="python -m router")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("create")
    p.add_argument("name")
    p.add_argument("--domain", default="icons")
    p.add_argument("--model", default="claude-sonnet-5-5")
    p.add_argument("--calls-per-day", type=int, default=5000)
    p.add_argument("--context", default="Default", help="name of the first context")

    p = sub.add_parser("context")
    p.add_argument("project")
    p.add_argument("name", nargs="?", help="add a context with this name; list the contexts without one")

    p = sub.add_parser("generate")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("concepts", nargs="+")

    p = sub.add_parser("feedback")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("signal", choices=["direction", "critique", "pick", "edit"])
    p.add_argument("--text")
    p.add_argument("--output")
    p.add_argument("--chosen")
    p.add_argument("--rejected")
    p.add_argument("--after-file")

    p = sub.add_parser("lessons")
    p.add_argument("project")

    p = sub.add_parser("confirm")
    p.add_argument("project")
    p.add_argument("lesson")
    p.add_argument("--temporary", action="store_true")
    p.add_argument("--statement")
    p.add_argument("--reach", choices=["context", "model"], help="override the extractor: this context only, or every context")

    p = sub.add_parser("reject")
    p.add_argument("project")
    p.add_argument("lesson")

    p = sub.add_parser("train")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("--count", type=int, default=40)

    p = sub.add_parser("adapter")
    p.add_argument("project")
    p.add_argument("version")
    p.add_argument("status", choices=["passed", "below target", "prompt only", "training", "failed"])
    p.add_argument("--note", default="")

    p = sub.add_parser("message")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("concept")
    p.add_argument("--mode", default="bare", choices=["bare", "routed", "full"])
    p.add_argument("--without")

    p = sub.add_parser("import")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("config", choices=["adapter", "adapter + routed context"])
    p.add_argument("file")

    p = sub.add_parser("absorb")
    p.add_argument("project")
    p.add_argument("lesson")
    p.add_argument("file")

    p = sub.add_parser("eval")
    p.add_argument("project")
    p.add_argument("--context")
    p.add_argument("--n", type=int, default=12)

    args = parser.parse_args()
    if args.command == "create":
        print(store.create(args.name, args.domain, args.model, args.calls_per_day, args.context)["id"])
    elif args.command == "context":
        if args.name:
            print(store.add_context(args.project, args.name)["id"])
        for c in store.load(args.project)["contexts"]:
            print(c["id"], "-", c["name"])
    elif args.command == "generate":
        for o in pipeline.generate(args.project, args.concepts, args.context):
            print(o["id"], o["concept"], "ok" if not o["problems"] else o["problems"], f"{o['input_tokens']} in")
    elif args.command == "feedback":
        payload = {"signal": args.signal, "text": args.text, "output_id": args.output, "chosen_id": args.chosen, "rejected_id": args.rejected}
        if args.after_file:
            payload["after"] = open(args.after_file).read()
        for x in pipeline.feedback(args.project, payload, args.context):
            print(x["id"], x["scope"], x["reach"], x["expressible_as"], x["relation"], x["related_to"] or "", "-", x["statement"])
    elif args.command == "lessons":
        show_lessons(store.load(args.project))
    elif args.command == "confirm":
        x = pipeline.confirm(args.project, args.lesson, "temporary" if args.temporary else "permanent", args.statement, args.reach)
        print(x["route"], "-", x["reason"])
    elif args.command == "reject":
        pipeline.reject(args.project, args.lesson)
    elif args.command == "train":
        s = pipeline.train(args.project, args.count, args.context)
        print(f"batch {s['batch']}: {s['calls']} calls, {s['valid']} valid, context {s['context_tokens']} tokens")
    elif args.command == "adapter":
        pipeline.record_adapter(args.project, args.version, args.status, args.note)
    elif args.command == "message":
        print(pipeline.try_message(args.project, args.concept, args.mode, args.without, args.context))
    elif args.command == "import":
        print(len(pipeline.import_outputs(args.project, args.config, json.load(open(args.file)), args.context)), "imported")
    elif args.command == "absorb":
        x = pipeline.absorption(args.project, args.lesson, json.load(open(args.file)))
        print(x["absorption"], "retired" if x.get("retired") else "kept in context")
    elif args.command == "eval":
        e = pipeline.evaluate(args.project, args.n, pipeline.FRONTIER, args.context)
        json.dump(e["rows"], sys.stdout, indent=1)
        print()


if __name__ == "__main__":
    main()
