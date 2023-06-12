const group = await p.group(
  {
    name: () => p.text({ message: "What is your name?" }),
    age: () => p.text({ message: "What is your age?" }),
    color: ({ results }) =>
      p.multiselect({
        message: `What is your favorite color ${results.name}?`,
        options: [
          { value: "red", label: "Red" },
          { value: "green", label: "Green" },
          { value: "blue", label: "Blue" },
        ],
      }),
  },
  {
    // On Cancel callback that wraps the group
    // So if the user cancels one of the prompts in the group this function will be called
    onCancel: ({ results }) => {
      p.cancel("Operation cancelled.");
      process.exit(0);
    },
  }
);

console.log(group.name, group.age, group.color);

const s = p.spinner();
s.start("Installing via npm");
await wait(2500);
s.stop("Installed via npm");

const additionalTools = await p.multiselect({
  message: "Select additional tools.",
  options: [
    { value: "eslint", label: "ESLint", hint: "recommended" },
    { value: "prettier", label: "Prettier" },
    { value: "gh-action", label: "GitHub Action" },
  ],
  required: false,
});

const projectType = await p.select({
  message: "Pick a project type.",
  options: [
    { value: "ts", label: "TypeScript" },
    { value: "js", label: "JavaScript" },
    { value: "coffee", label: "CoffeeScript", hint: "oh no" },
  ],
});

// yes/no prompt
const shouldContinue = await p.confirm({
  message: "Do you want to continue?",
});

const meaning = await p.text({
  message: "What is the meaning of life?",
  placeholder: "Not sure",
  initialValue: "42",
  validate(value) {
    if (value.length === 0) return `Value is required!`;
  },
});

if (p.isCancel(meaning)) {
  cancel("Operation cancelled.");
  process.exit(0);
}

p.intro(chalk.blue("Squeleto Utility"));

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];
console.log(command, param);

// Do stuff
p.outro(`You're all set!`);

async function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
