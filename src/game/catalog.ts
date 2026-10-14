import type { Heroine } from "./types.js";
export const HEROINES: Heroine[] = [
 {id:"arturo",name:"Rey Arturo",rarity:"SSR",heroClass:"Espadachina",stage:"Epic",darkAvailable:true,attack:34,maxHp:110,description:"El rey que reunió a los caballeros."},
 {id:"juana",name:"Juana de Arco",rarity:"SR",heroClass:"Lancera",stage:"Hero",darkAvailable:true,attack:23,maxHp:125,description:"La doncella de Orleans protege a sus aliados."},
 {id:"cleopatra",name:"Cleopatra",rarity:"SR",heroClass:"Hechicera",stage:"Lily",darkAvailable:false,attack:17,maxHp:145,description:"La reina que engaña al destino."},
 {id:"musashi",name:"Miyamoto Musashi",rarity:"R",heroClass:"Espadachina",stage:"Hero",darkAvailable:true,attack:29,maxHp:95,description:"El espadachín encadena cortes precisos."},
 {id:"hercules",name:"Hércules",rarity:"SR",heroClass:"Lancera",stage:"Epic",darkAvailable:true,attack:19,maxHp:175,description:"El héroe de los doce trabajos."},
 {id:"robin-hood",name:"Robin Hood",rarity:"R",heroClass:"Arquera",stage:"Lily",darkAvailable:false,attack:25,maxHp:105,description:"El arquero de Sherwood encuentra puntos débiles."}
];
export function getHeroine(id: string): Heroine | undefined { return HEROINES.find(hero => hero.id === id); }
