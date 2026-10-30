# Action cues learned from the training triggers

1075 training messages; 9 cues learned (min count 2, share 0.8).

| trigger (cut) | n | actions | decision |
|---|---|---|---|
| connect | 512 | connect 512 | already a cue |
| make | 428 | set 420, create 5, resize 2, connect 1 | already a cue of create (conflict: data says set) |
| put | 260 | move 159, create 96, arrange 2, toFront 2, connect 1 | ambiguous: move 159, create 96, arrange 2, toFront 2, connect 1 |
| move | 199 | move 199 | already a cue |
| set | 180 | set 180 | already a cue |
| create | 103 | create 103 | already a cue |
| link | 84 | connect 84 | already a cue |
| rename | 75 | rename 75 | already a cue |
| duplicate | 74 | duplicate 74 | already a cue |
| arrange | 55 | arrange 55 | already a cue |
| add | 52 | create 38, connect 14 | ambiguous: create 38, connect 14 |
| delete | 50 | delete 50 | already a cue |
| label | 45 | label 42, connect 3 | a value word of another legend question, not an action |
| chain | 45 | connect 45 | a value word of another legend question, not an action |
| undo | 44 | undo 44 | already a cue |
| align | 41 | align 41 | already a cue |
| swap | 39 | swap 39 | already a cue |
| forget | 38 | forget 38 | already a cue |
| redo | 34 | redo 34 | already a cue |
| disconnect | 29 | disconnect 29 | already a cue |
| colour | 27 | set 27 | a value word of another legend question, not an action |
| enlarge | 25 | resize 25 | already a cue |
| distribute | 24 | distribute 24 | already a cue |
| draw | 22 | create 19, connect 3 | already a cue |
| shrink | 20 | resize 20 | already a cue |
| below | 18 | move 18 | a value word of another legend question, not an action |
| goes | 18 | move 13, connect 5 | ambiguous: move 13, connect 5 |
| above | 18 | move 17, arrange 1 | a value word of another legend question, not an action |
| place | 17 | create 9, move 7, arrange 1 | ambiguous: create 9, move 7, arrange 1 |
| remove | 13 | disconnect 9, delete 4 | ambiguous: disconnect 9, delete 4 |
| row | 11 | arrange 11 | a value word of another legend question, not an action |
| resize | 10 | resize 10 | already a cue |
| right | 10 | move 10 | a value word of another legend question, not an action |
| color | 9 | set 9 | a value word of another legend question, not an action |
| turn | 8 | set 8 | already a cue |
| left | 8 | move 8 | a value word of another legend question, not an action |
| grid | 7 | arrange 7 | a value word of another legend question, not an action |
| column | 7 | arrange 7 | a value word of another legend question, not an action |
| join | 7 | connect 7 | already a cue |
| distributed | 7 | distribute 7 | LEARNED |
| chained | 7 | connect 7 | a value word of another legend question, not an action |
| between | 6 | move 6 | a value word of another legend question, not an action |
| huge | 5 | set 5 | a value word of another legend question, not an action |
| connects | 5 | connect 5 | LEARNED |
| its right | 5 | move 5 | a value word of another legend question, not an action |
| near | 5 | move 5 | a value word of another legend question, not an action |
| each | 5 | connect 5 | a value word of another legend question, not an action |
| hook | 4 | connect 4 | already a cue |
| send | 4 | toBack 3, toFront 1 | ambiguous: toBack 3, toFront 1 |
| rid | 4 | delete 3, disconnect 1 | ambiguous: delete 3, disconnect 1 |
| call | 4 | rename 4 | already a cue |
| leads | 4 | connect 4 | LEARNED |
| top | 4 | move 4 | a value word of another legend question, not an action |
| slide | 3 | move 3 | already a cue |
| back | 3 | toBack 2, connect 1 | ambiguous: toBack 2, connect 1 |
| another | 3 | create 3 | a value word of another legend question, not an action |
| sends | 3 | connect 3 | LEARNED |
| front | 3 | toFront 2, move 1 | ambiguous: toFront 2, move 1 |
| shrunk | 3 | resize 3 | LEARNED |
| sits | 3 | move 3 | LEARNED |
| its left | 3 | move 3 | a value word of another legend question, not an action |
| slap | 2 | create 2 | already a cue |
| bring | 2 | toFront 2 | already a cue |
| give | 2 | set 2 | already a cue |
| line up | 2 | arrange 2 | a value word of another legend question, not an action |
| push | 2 | move 2 | already a cue |
| shove | 2 | move 2 | already a cue |
| linked | 2 | connect 2 | a value word of another legend question, not an action |
| tint | 2 | set 2 | LEARNED |
| links | 2 | connect 2 | a value word of another legend question, not an action |
| circle | 2 | arrange 2 | a value word of another legend question, not an action |
| under | 2 | move 2 | a value word of another legend question, not an action |
| next | 2 | move 2 | a value word of another legend question, not an action |
| name | 2 | rename 2 | LEARNED |
| goes near | 2 | move 2 | a value word of another legend question, not an action |
| goes below | 2 | move 2 | a value word of another legend question, not an action |
| connected | 2 | connect 2 | a value word of another legend question, not an action |
| spread | 2 | distribute 2 | already a cue |
| connected to each other | 2 | connect 2 | a value word of another legend question, not an action |
| spaced | 2 | distribute 2 | LEARNED |
| each leading | 2 | connect 2 | a value word of another legend question, not an action |
| stack | 1 | move 1 | a value word of another legend question, not an action |
| make every shape | 1 | resize 1 | a value word of another legend question, not an action |
| not linked | 1 | disconnect 1 | a value word of another legend question, not an action |
| paint | 1 | set 1 | seen 1x |
| sends traffic | 1 | connect 1 | seen 1x |
| write | 1 | connect 1 | seen 1x |
| bigger | 1 | resize 1 | a value word of another legend question, not an action |
| feeds | 1 | connect 1 | seen 1x |
| become | 1 | set 1 | seen 1x |
| starts | 1 | move 1 | seen 1x |
| sit between | 1 | move 1 | a value word of another legend question, not an action |
| last | 1 | set 1 | a value word of another legend question, not an action |
| beside | 1 | move 1 | a value word of another legend question, not an action |
| triggers | 1 | connect 1 | seen 1x |
| line | 1 | arrange 1 | a value word of another legend question, not an action |
| teal | 1 | set 1 | a value word of another legend question, not an action |
| wire | 1 | connect 1 | seen 1x |
| mark | 1 | set 1 | seen 1x |
| arrows from each | 1 | connect 1 | a value word of another legend question, not an action |
| talks | 1 | connect 1 | seen 1x |
| fans out | 1 | connect 1 | seen 1x |
| pixels down | 1 | move 1 | a value word of another legend question, not an action |
| sit | 1 | arrange 1 | seen 1x |
| tiny | 1 | set 1 | a value word of another legend question, not an action |
| into | 1 | connect 1 | seen 1x |
| stays | 1 | move 1 | seen 1x |
| take out | 1 | disconnect 1 | seen 1x |
| pixels | 1 | move 1 | seen 1x |
| plant | 1 | create 1 | seen 1x |
| hang | 1 | create 1 | seen 1x |
| up top | 1 | move 1 | a value word of another legend question, not an action |
| dotted | 1 | connect 1 | a value word of another legend question, not an action |
| big | 1 | set 1 | a value word of another legend question, not an action |
| connect to each other | 1 | connect 1 | a value word of another legend question, not an action |
| sever | 1 | disconnect 1 | seen 1x |
| arrows from | 1 | connect 1 | a value word of another legend question, not an action |
| small | 1 | set 1 | a value word of another legend question, not an action |
| pointing | 1 | connect 1 | seen 1x |
| draw lines | 1 | connect 1 | a value word of another legend question, not an action |
| take away | 1 | disconnect 1 | seen 1x |
| switch places | 1 | swap 1 | seen 1x |
| sends samples | 1 | connect 1 | seen 1x |
| large | 1 | set 1 | a value word of another legend question, not an action |
| each pointing | 1 | connect 1 | a value word of another legend question, not an action |
| drop | 1 | disconnect 1 | seen 1x |
| top left | 1 | move 1 | a value word of another legend question, not an action |
| make connection | 1 | connect 1 | a value word of another legend question, not an action |
| bottom right | 1 | move 1 | a value word of another legend question, not an action |
| put under | 1 | move 1 | a value word of another legend question, not an action |
| connected each | 1 | connect 1 | a value word of another legend question, not an action |
| each linked | 1 | connect 1 | a value word of another legend question, not an action |
| cut | 1 | disconnect 1 | seen 1x |
| goes right | 1 | move 1 | a value word of another legend question, not an action |
