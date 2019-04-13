exports.up = knex =>
    knex.schema
        .createTable('players', table => {
            table.string('id').primary();
            table.integer('elo');
            table.integer('win');
            table.integer('draw');
            table.integer('lose');
            table.integer('total');
            table.boolean('playing');
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
