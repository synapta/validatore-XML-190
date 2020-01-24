const { Pool } = require('pg')



//-----------------------------------------

exports.getGuriDetails = function (id_fonte) {
    return `select bh.*, c.cig, cpv.cpv, coalesce(be.cf, be.piva) as cf, cup.cup
            from bando_history bh
            left join cig c on bh.id_cig = c.id_cig
            left join cpv on bh.id_cpv = cpv.id_cpv
            left join business_entity be  on bh.id_be = be.id_be
            left join cup on bh.id_opera = cup.id_opera
            where not exists (
            	select 1
            	from bando_history bh2
            	where bh2.id_fonte = bh.id_fonte
            	and manual = true
            )
            and manual = false
            and bh.id_fonte = '${id_fonte}' --richiedo proprio questo id
            union
            select  bh2.*,c.cig, cpv.cpv, coalesce(be.cf, be.piva) as cf, cup.cup
            from bando_history bh2
            left join cig c on bh2.id_cig = c.id_cig
            left join cpv on bh2.id_cpv = cpv.id_cpv
            left join business_entity be  on bh2.id_be = be.id_be
            left join cup on bh2.id_opera = cup.id_opera
            where bh2.id_fonte = '${id_fonte}'
            and manual = true;`;
}

exports.getNextGuri = function () {
    return `
            select *
            from bando_history as bh1
            where bh1.manual is false
            and bh1.id_fonte is not null
            and bh1.fonte = 'guri'
            and not exists (
            	select 1
            	from bando_history as bh2
            	where bh2.manual is true
            	and bh2.fonte = 'guri'
            	and bh2.id_fonte is not null
            	and bh1.id_fonte = bh2.id_fonte
            )
            order by bh1.data_pubblicazione desc
            limit 1;
    `;
}

exports.launchPostgresQuery = function (response, query) {
    pool.query(query).then(res => {
        response.send(res);
    })
}

exports.launchSimplePostgresQuery = function (query, cb) {
    console.log(query)
    pool.query(query).then(res => {
        cb(res);
    })
}

exports.launchMultiplePostgresQuery = function (response, queryObj) {
    var items = Object.keys(queryObj);
    var i = 0;

    function askAgain() {
        pool.query(queryObj[items[i]]).then(res => {
            queryObj[items[i]] = res
            i++;
            if (i === items.length) {
               response.send(queryObj);
            } else {
               askAgain();
            }
        })
    };
    askAgain();
}

exports.statGuri = function () {
    return `with fatte as (
                select data_pubblicazione, id_fonte, manual
                from bando_history
                where fonte = 'guri'
                and manual = true
                and id_fonte is not null
            ), totale as (
                select data_pubblicazione, id_fonte, manual
                from bando_history
                where fonte = 'guri'
                and manual is false
                and id_fonte is not null
            ), da_fare as (
                select t.data_pubblicazione
                from fatte f full outer join totale t
                on f.id_fonte = t.id_fonte
                where f.id_fonte is null
            )
            select count(*),'fatte 30 giorni' as tipo, 1 as ordine
            from fatte
            where data_pubblicazione > now() - interval '30 days'
            union
            select count(*),'da fare 30 giorni' as tipo, 2 as ordine
            from da_fare
            where data_pubblicazione > now() - interval '30 days'
            union
            select count(*), 'totale 30 giorni' as tipo, 3 as ordine
            from totale
            where data_pubblicazione > now() - interval '30 days'
            union
            select count(*),'fatte sempre' as tipo, 4 as ordine
            from fatte
            union
            select count(*),'da fare sempre' as tipo, 5 as ordine
            from da_fare
            union
            select count(*), 'totale sempre' as tipo, 6 as ordine
            from totale
            order by ordine;`;
}

exports.recentGuri = function () {
    return `--ultimi 70 bandi modificati
            select row_number() over (order by data_modifica desc) as n,id_fonte, data_modifica --,operatore
            from stack.bando_history_mod as bhm, bando_history as bh
            where bhm.id_bando = bh.id_bando
            and bh.fonte= 'guri'
            and manual = true
            order by data_modifica desc
            limit 70;`;
}

exports.saveGuri = function (obj) {
    return `
        select *
        from insertbando_bando_history(
            ${setNullField(obj.id_simog)},
            ${setNullField(obj.cig)},
            ${setNullField(obj.cf)},
            ${setNullField(obj.rup)},
            ${setNullField(obj.oggetto)},
            ${setNullField(obj.tipologia_inter)},
            ${setNullField(obj.settore)},
            ${setNullField(obj.scelta_contraente)},
            ${setNullField(obj.infrastruttura_strategica)},
            ${setNullField(obj.importo_complessivo)},
            ${setNullField(obj.criterio_aggiudicazione)},
            ${setNullField(obj.data_term_rich_chiar)},
            ${setNullField(obj.data_iniz_pres_off)},
            ${setNullField(obj.data_term_off)},
            ${setNullField(obj.data_seduta)},
            'guri',
            ${setNullField(obj.id_fonte)},
            'casanova',
            ${setNullField(obj.multi_cig)},
            ${setNullField(obj.orario_term_rich_chiar)},
            ${setNullField(obj.orario_iniz_press_off)},
            ${setNullField(obj.orario_term_off)},
            ${setNullField(obj.orario_seduta)},
            ${setNullField(obj.note)},
            ${setNullField(obj.cup)},
            ${setNullField(obj.cpv)},
            ${setNullField(obj.oneri_sicurezza)},
            ${setNullField(obj.data_pubblicazione)},
            ${setNullField(obj.n_lotti)},
            ${setNullField(obj.skip)}
        )
    `;
}

function setNullField(field) {
    if (field === undefined || field === null || field === "" || field === "Vuoto"|| Number.isNaN(field)) return 'null';
    if (field === true) return true;
    if (field === false) return false;
    if (Array.isArray(field)) {
        var fields = field.map(setNullField)
        return "(" + fields.join(", ") + ")"
    }
    field = "'" + field.toString().replace(/'/g,"''").replace(/\\/g, '\\\\') + "'";
    return field;
}
