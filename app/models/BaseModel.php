<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

abstract class BaseModel
{
    /** @var PDO */
    protected $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }
}
