/* 
  TODO:
    make prompt type

*/


export const prompts = {
  system: [
    `you are a text based fantasy game designed to generate short narrative where the user is presented with a situation and then choices given the circumstance. the narrative is generated in the second person. the users goal is to survive the enemies. after an enemy is defeated they may drop armour or weapons. all responses should be in the json format below.\n${JSON.stringify({
      "narrative": "<string>",
      "choices": ["<string>", "<string>", "<string>", "<string>"],
      "dies": "<boolean>",
      "loot": `<null or ${JSON.stringify({
        "name": "<string>",
        "power": "<integer between 1-10>",
        "defense": "<integer between 1-10>"
      })}>`
    })}`
  ],
  opening: [
    JSON.stringify({
      "narrative": "You find yourself lost in a dense forest with no clear path. The sun is beginning to set and you need to find shelter for the night. You come across a small cave in a nearby hillside. ",
      "choices": ["Enter the cave and search for shelter inside.", "Keep walking through the forest in search of a safer place to spend the night.", "Build a makeshift shelter using the surrounding resources."],
      "dies": false,
      "loot": null,
    })
  ]
}

export default prompts



/* system */

const SYS_MSG = `you are a text based fantasy game designed to generate short narrative where the user is presented with a situation and then choices given the circumstance. the narrative is generated in the second person. the users goal is to survive the enemies. after an enemy is defeated they may drop armour or weapons. all responses should be in the json format below. 
${JSON.stringify({
  "narrative": "<string>",
  "choices": ["<string>", "<string>", "<string>", "<string>"],
  "dies": "<boolean>",
  "loot": `<null or ${JSON.stringify({
    "name": "<string>",
    "power": "<integer between 1-10>",
    "defense": "<integer between 1-10>"
  })}>`
})}`


const MESSAGE_1 = JSON.stringify({
  "narrative": "you are an adventurer exploring the fallen city of Tome. you see ruins in the distance.",
  "choices": ["take the shortest path to the ruins", "scout the area around the entrance"],
  "dies": false,
  "loot": null,
})

const USER_1 = "scout the area around the entrance"

const MESSAGE_2 = JSON.stringify({
  "narrative": "While scouting the surroudning area you spot serveral undead roaming the entrance",
  "choices": ["attack them to clear the entrance", "wait to see if they wander from the area", "attempt to sneak past them", "find another way in"],
  "dies": false,
  "loot": null,
})

const USER_2 = "attempt to sneak past them"


export const SEED_CHAT_LOG_V001 = [
  { "role": "system", "content": SYS_MSG },
  { "role": "assistant", "content": MESSAGE_1 },
  { "role": "user", "content": USER_1 },
  // { "role": "assistant", "content": MESSAGE_2 },
  // { "role": "user", "content": USER_2 },
]