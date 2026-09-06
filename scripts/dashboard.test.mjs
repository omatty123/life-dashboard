import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../dashboard.js',import.meta.url),'utf8');
const start=source.indexOf('function validatePrivateLinks(');
const end=source.indexOf('\ntry {',start);
const context=vm.createContext({URL,privateProjects:new Set(['test'])});
vm.runInContext(source.slice(start,end),context);
const validate=value=>context.validatePrivateLinks(value);
const input=url=>({version:1,links:{test:[{label:'Open',url}]}});
test('private links accept HTTPS and omit unknown project IDs',()=>{
 const valid=input('https://example.com/private'); valid.links.unrelated=[{label:'Unknown',url:'https://example.net'}];
 assert.equal(validate(valid).test[0].url,'https://example.com/private'); assert.equal(Object.keys(validate(valid)).length,1);
});
test('private links reject executable URLs, credentials, malformed inputs and empty imports',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hello','file:///etc/passwd','http://example.com','https://name:secret@example.com']) assert.throws(()=>validate(input(url)));
 for(const value of [null,[],{}, {version:1,links:{}}, {version:1,links:{test:[]}}, {version:1,links:{test:[null]}}]) assert.throws(()=>validate(value));
});
test('all original projects survive with unique IDs and usable destinations or an explicit private/local action',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const p=vm.runInNewContext(html.match(/const projects = (\[[\s\S]*?\n\s*\]);/)[1]);
 assert.equal(p.length,41); assert.equal(new Set(p.map(x=>x.id)).size,41);
 for(const project of p) assert.ok(project.private || project.id==='meta' || project.links.some(l=>l.url?.startsWith('https://')));
 assert.ok(!html.includes('https://omatty123.github.io/teaching-today/'));
 assert.ok(!html.includes('https://omatty123.github.io/hist213-dashboard/'));
});
