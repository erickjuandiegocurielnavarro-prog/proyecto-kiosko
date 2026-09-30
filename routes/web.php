<?php

declare(strict_types=1);

return [
    ['GET', '/', 'RaffleController@index'],
    ['GET', '/login', 'AuthController@showLogin'],
    ['POST', '/login', 'AuthController@login'],
    ['GET', '/register', 'AuthController@showRegister'],
    ['POST', '/register', 'AuthController@register'],
    ['GET', '/logout', 'AuthController@logout'],

    ['GET', '/raffles/create', 'RaffleController@createForm'],
    ['POST', '/raffles', 'RaffleController@store'],
    ['GET', '/raffles/edit/{id}', 'RaffleController@editForm'],
    ['POST', '/raffles/update/{id}', 'RaffleController@update'],
    ['POST', '/raffles/delete/{id}', 'RaffleController@delete'],
    ['GET', '/api/raffles/{id}/tickets', 'RaffleController@tickets'],

    ['POST', '/api/tickets/purchase', 'TicketController@purchase'],

    ['GET', '/admin', 'AdminController@dashboard'],
];
