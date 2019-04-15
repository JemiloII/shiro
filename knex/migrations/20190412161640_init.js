exports.up = knex =>
    knex.schema
        .createTable('players', table => {
            table.string('id').primary();
            table.integer('elo').defaultTo(1200);
            table.integer('win').defaultTo(0);
            table.integer('draw').defaultTo(0);
            table.integer('lose').defaultTo(0);
            table.integer('total').defaultTo(0);
            table.boolean('playing').defaultTo(false);
        })
        .createTable('games', table => {
            table.integer('id').primary();
            table.string('white').references('player.id');
            table.string('black').references('player.id');
            table.text('fen');
            table.text('pgn');
            table.string('winner');
            table.string('reason');
        });

exports.down = knex =>
    knex.schema
        .dropTable('players')
        .dropTable('games');
